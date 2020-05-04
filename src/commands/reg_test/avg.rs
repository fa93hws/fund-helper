use chrono::NaiveDateTime;

use crate::models::fund_list::FundListDAO;
use crate::models::fund_value::{FundValueDAO, FundValueData};
use crate::services::database::{DatabaseService, Environment};
use crate::services::east_money::EastMoneyService;
use crate::services::http::HttpService;
use crate::services::{FundListService, FundValueService};

fn calculate_average(values: &Vec<f32>) -> f32 {
    if values.len() == 0 {
        0.0
    } else {
        let len: f32 = values.len() as f32;
        let sum = values.into_iter().fold(0.0, |acc, cur| acc + cur);
        sum / len
    }
}

fn max(values: &Vec<f32>) -> f32 {
    values.into_iter().fold(
        std::f32::MIN,
        |acc, cur| if acc > *cur { acc } else { *cur },
    )
}
fn min(values: &Vec<f32>) -> f32 {
    values.into_iter().fold(
        std::f32::MAX,
        |acc, cur| if acc < *cur { acc } else { *cur },
    )
}

// 在没有任何头寸时，如果当日的收盘价高于前 {buy_period} 日的最高价，则做多
// 持有多头头寸时，如果当日收盘价低于前 {sell_period} 日的最低价时，平掉多头仓位
// 当持有任何仓位时，如果价格触及止损线则平仓止损。
fn regression_test_with_average(data: &Vec<FundValueData>, buy_period: usize, sell_period: usize) {
    let initial_money = 100.0;
    let mut buy_count = 0.0;
    let mut money = initial_money;
    let mut shares = 0.0;
    for idx in buy_period..data.len() {
        if data[idx].date <= data[idx-1].date {
            panic!("data is not in order!");
        }
        let current_value = data[idx].real_value;
        let data_buy_period = &data[(idx - buy_period)..idx];
        let values_buy_period: Vec<f32> =
            data_buy_period.into_iter().map(|x| x.real_value).collect();
        let data_sell_period = &data[(idx - sell_period)..idx];
        let values_sell_period: Vec<f32> =
            data_sell_period.into_iter().map(|x| x.real_value).collect();
        let max_buy_period = max(&values_buy_period);
        let min_sell_period = min(&values_sell_period);
        if shares > 1e-10 && current_value < min_sell_period {
            money = shares * current_value;
            shares = 0.0;
        }
        if shares < 1e-10 && current_value > max_buy_period {
            buy_count += 1.0;
            shares = money / current_value;
            money = 0.0;
        }
    }
    money = if shares < 1e-10 {
        money
    } else {
        data.last().unwrap().real_value * shares
    };
    let num_years = (data.last().unwrap().date.timestamp() - data.first().unwrap().date.timestamp()) as f32 / 365.0 / 3600.0 / 24.0;
    let arr = ((money / initial_money).powf(1.0 / num_years) - 1.0) * 100.0;
    println!("Arr: {}% (不含手续费)", arr);
    println!("出手次数: {}/年", buy_count / num_years);
}

pub async fn test_with_avg(id: &str) {
    let http_service = HttpService::new();
    let east_money_service = EastMoneyService::new(&http_service);
    let database_service = DatabaseService::new(Environment::Prod);
    let fund_value_dao = FundValueDAO::new(&database_service);
    let fund_value_service = FundValueService::new(&east_money_service, &fund_value_dao);
    let fund_list_dao = FundListDAO::new(&database_service);
    let fund_list_service = FundListService::new(&east_money_service, &fund_list_dao);

    let fund_info = fund_list_service.find_fund_info(id).await;
    println!(
        "Performing regression test for {}@{} ({:?}) with average index",
        fund_info.name, fund_info.id, fund_info.typ
    );
    let fund_values = fund_value_service.get_values_for_regression(id).await;
    regression_test_with_average(&fund_values, 50, 10);
}

#[cfg(test)]
mod test {
    use super::*;
    use assert_approx_eq::assert_approx_eq;

    #[test]
    fn test_average_few_numbers() {
        let nums: Vec<f32> = vec![1.0, 1.25, 2.5, 1.23, 5.12];
        let got = calculate_average(&nums);
        let expected = 2.22;
        assert_approx_eq!(got, expected, 1e-10);
    }

    #[test]
    fn test_average_empty() {
        let nums: Vec<f32> = vec![];
        let got = calculate_average(&nums);
        let expected = 0.0;
        assert_approx_eq!(got, expected, 1e-10);
    }

    #[test]
    fn test_max() {
        let nums: Vec<f32> = vec![1.0, 1.25, 2.5, -2.65, 10.5, -2.0, -15.0, 0.0];
        let got = max(&nums);
        let expected = 10.5;
        assert_approx_eq!(got, expected, 1e-10);
    }

    #[test]
    fn test_min() {
        let nums: Vec<f32> = vec![1.0, 1.25, 2.5, -2.65, 10.5, -2.0, -15.0, 0.0];
        let got = min(&nums);
        let expected = -15.0;
        assert_approx_eq!(got, expected, 1e-10);
    }
}
