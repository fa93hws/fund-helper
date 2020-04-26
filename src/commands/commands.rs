use super::{db, fetch};
use crate::services::database::DatabaseService;
use crate::services::east_money::EastMoneyService;
use crate::services::http::HttpService;

pub struct Services<'a> {
    pub http_service: &'a HttpService,
    pub east_money_service: &'a EastMoneyService<'a>,
    pub database_service: &'a DatabaseService,
}

pub fn main(matches: clap::ArgMatches<'_>) {
    let http_service = HttpService::new();
    let east_money_service = EastMoneyService::new(&http_service);
    // TODO: Inject params from docker-compose.yml
    let database_service = DatabaseService::new("fund-helper", "fund-helper", "fund_helper", 5432);
    let services = Services {
        http_service: &http_service,
        east_money_service: &east_money_service,
        database_service: &database_service,
    };

    if let Some(ref matches) = matches.subcommand_matches("fetch") {
        fetch::main(matches, &services);
    }

    if let Some(ref matches) = matches.subcommand_matches("db") {
        db::main(matches, &services);
    }
}
