use crate::models::fund_list::FundListDAO;
use crate::services::database::{DatabaseService, Environment};
use crate::services::east_money::EastMoneyService;
use crate::services::http::HttpService;
use crate::services::{FundListService, FundValueService};

fn fetch_one(id: &str) {
    println!("fetching fund: {}", id);
    let http_service = HttpService::new();
    let east_money_service = EastMoneyService::new(&http_service);
    let fund_value_service = FundValueService::new(&east_money_service);

    let fund_values = fund_value_service.fetch(id, 1);
    println!("{:?}", fund_values);
}

fn fetch_all() {
    println!("fetching list");
    let http_service = HttpService::new();
    let east_money_service = EastMoneyService::new(&http_service);
    let database_service = DatabaseService::new(Environment::Prod);
    let fund_list_dao = FundListDAO::new(&database_service);
    let fund_service = FundListService::new(&east_money_service, &fund_list_dao);

    let fund_list = fund_service.fetch();
    println!("list fetched");
    fund_service.write_to_db(&fund_list);
}

pub(in crate::commands) fn main(matches: &clap::ArgMatches<'_>) {
    if !matches.is_present("fund-id") {
        fetch_all();
    } else if let Some(ids) = matches.values_of("fund-id") {
        for id in ids {
            fetch_one(id);
        }
    }
}
