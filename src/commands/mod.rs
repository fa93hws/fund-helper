mod fetch;

use super::services;
type HttpService = services::http_service::HttpService;
type EastMoneyService<'a> = services::east_money_service::EastMoneyService<'a>;

pub struct Services<'a> {
  pub http_service: &'a HttpService,
  pub east_money_service: &'a EastMoneyService<'a>,
}

pub fn main(matches: clap::ArgMatches<'_>) {
  let http_service = HttpService::new();
  let east_money_service = EastMoneyService::new(&http_service);
  let services = Services {
    http_service: &http_service,
    east_money_service: &east_money_service,
  };

  if let Some(ref matches) = matches.subcommand_matches("fetch") {
    fetch::main(matches, services);
  }
}