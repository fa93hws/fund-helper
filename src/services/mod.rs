mod http_service;
pub use http_service::{create_unknown_error, HttpError};
pub use http_service::{HttpService, IHttpService};

mod east_money_service;
pub use east_money_service::EastMoneyService;

pub use http_service::MockHttpService;
