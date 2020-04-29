use crate::models::fund_list::FundListDAO;
use crate::models::fund_value::FundValueDAO;
use crate::services::database::{DatabaseService, Environment};
use crate::services::east_money::EastMoneyService;
use crate::services::http::HttpService;
use crate::services::{FundListService, FundValueService};

async fn fetch_one(id: &str) {
    let http_service = HttpService::new();
    let east_money_service = EastMoneyService::new(&http_service);
    let database_service = DatabaseService::new(Environment::Prod);
    let fund_value_dao = FundValueDAO::new(&database_service);
    let fund_value_service = FundValueService::new(&east_money_service, &fund_value_dao);
    let fund_list_dao = FundListDAO::new(&database_service);
    let fund_list_service = FundListService::new(&east_money_service, &fund_list_dao);

    let fund_info = fund_list_service.find_fund_info(id).await;
    println!(
        "Fetching fund for {}@{} ({:?})",
        fund_info.name, fund_info.id, fund_info.typ
    );
    fund_value_service.fetch_and_update_db(id).await;
}

async fn fetch_all() {
    println!("fetching list");
    let http_service = HttpService::new();
    let east_money_service = EastMoneyService::new(&http_service);
    let database_service = DatabaseService::new(Environment::Prod);
    let fund_list_dao = FundListDAO::new(&database_service);
    let fund_list_service = FundListService::new(&east_money_service, &fund_list_dao);

    let fund_list = fund_list_service.fetch().await;
    println!("list fetched");
    fund_list_service.write_to_db(&fund_list).await;
}

pub(in crate::commands) async fn main(matches: &clap::ArgMatches<'_>) {
    if !matches.is_present("fund-id") {
        fetch_all().await;
    } else if let Some(ids) = matches.values_of("fund-id") {
        for id in ids {
            fetch_one(id).await;
        }
    }
}
