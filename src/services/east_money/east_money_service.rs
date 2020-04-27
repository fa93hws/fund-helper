use super::{extract_fund_list, extract_fund_values};
use crate::models::fund_list::FundList;
use crate::models::fund_value::FundValueModel;
use crate::services::http::CanGetHTTP;
use crate::utils::context::{FetchListContext, FetchValueContext};

const FETCH_FUND_PREFIX: &str = "http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=";
const FETCH_LIST_URL: &str = "http://fund.eastmoney.com/js/fundcode_search.js";

pub struct EastMoneyService<'a> {
    http_service: &'a dyn CanGetHTTP,
}

impl EastMoneyService<'_> {
    pub fn new(http_service: &dyn CanGetHTTP) -> EastMoneyService {
        EastMoneyService { http_service }
    }
}

impl EastMoneyService<'_> {
    pub async fn fetch_value(&self, id: &str) -> FundValueModel {
        let url = format!("{}{}", FETCH_FUND_PREFIX, id);
        let http_result = self.http_service.get(&url).await;
        let context = FetchValueContext {
            id: id.to_string(),
            page: 1,
        };
        match http_result {
            Ok(result) => extract_fund_values(&result, &context),
            Err(_) => panic!(format!("failed to fetch url {}", url)),
        }
    }

    pub async fn fetch_list(&self) -> FundList {
        let http_result = self.http_service.get(FETCH_LIST_URL).await;
        let context = FetchListContext {};
        match http_result {
            Ok(result) => extract_fund_list(&result, &context),
            Err(_) => panic!("failed to fetch list"),
        }
    }
}

#[cfg(test)]
mod tests {
    use async_trait::async_trait;
    use futures::executor::block_on;

    use super::EastMoneyService;
    use crate::models::fund_value::{FundValueData, FundValueModel};
    use crate::services::http::{create_unknown_error, CanGetHTTP, HttpError};

    const FUND_ID: &str = "000123";

    #[test]
    fn test_fetch_success() {
        struct FakeHttpService {}
        #[async_trait]
        impl CanGetHTTP for FakeHttpService {
            async fn get(&self, url: &str) -> Result<String, HttpError> {
                let raw_response = String::from(
                    r#"var apidata={ content:"<table class='w782 comm lsjz'><thead><tr><th class='first'>净值日期</th><th>单位净值</th><th>累计净值</th><th>日增长率</th><th>申购状态</th><th>赎回状态</th><th class='tor last'>分红送配</th></tr></thead><tbody><tr><td>2020-04-24</td><td class='tor bold'>3.7510</td><td class='tor bold'>3.7510</td><td class='tor bold grn'>-1.16%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr><tr><td>2020-04-23</td><td class='tor bold'>3.7950</td><td class='tor bold'>3.7950</td><td class='tor bold grn'>-1.07%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr><tr><td>2020-04-22</td><td class='tor bold'>3.8360</td><td class='tor bold'>3.8360</td><td class='tor bold red'>2.48%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr><tr><td>2020-04-21</td><td class='tor bold'>3.7430</td><td class='tor bold'>3.7430</td><td class='tor bold grn'>-1.01%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr><tr><td>2020-04-20</td><td class='tor bold'>3.7810</td><td class='tor bold'>3.7810</td><td class='tor bold red'>0.43%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr></table>",records:2102,pages:211,curpage:1};"#,
                );
                assert_eq!(
                    url,
                    "http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=000123"
                );
                Ok(raw_response)
            }
        }

        let http_service = FakeHttpService {};
        let expected_fund_value_model = FundValueModel {
            curpage: 1,
            pages: 211,
            records: 2102,
            values: vec![
                FundValueData {
                    date: String::from("2020-04-24"),
                    real_value: 3.7510,
                },
                FundValueData {
                    date: String::from("2020-04-23"),
                    real_value: 3.7950,
                },
                FundValueData {
                    date: String::from("2020-04-22"),
                    real_value: 3.8360,
                },
                FundValueData {
                    date: String::from("2020-04-21"),
                    real_value: 3.7430,
                },
                FundValueData {
                    date: String::from("2020-04-20"),
                    real_value: 3.7810,
                },
            ],
        };
        let east_money_service = EastMoneyService::new(&http_service);
        let model = block_on(east_money_service.fetch_value(FUND_ID));
        assert_eq!(model, expected_fund_value_model);
    }

    #[test]
    #[should_panic(
        expected = "failed to fetch url http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=000123"
    )]
    fn test_fetch_fail() {
        struct FakeHttpService {}
        #[async_trait]
        impl CanGetHTTP for FakeHttpService {
            async fn get(&self, _: &str) -> Result<String, HttpError> {
                Err(create_unknown_error(None))
            }
        }

        let http_service = FakeHttpService {};
        let east_money_service = EastMoneyService::new(&http_service);
        block_on(east_money_service.fetch_value(FUND_ID));
    }
}
