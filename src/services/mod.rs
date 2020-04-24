mod http_service;
pub type HttpService = http_service::HttpService;

mod east_money_service;
pub type EastMoneyService<'a> = east_money_service::EastMoneyService<'a>;
