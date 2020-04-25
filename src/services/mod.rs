mod http_service;
pub use http_service::{HttpService, IHttpService};
pub use http_service::{HttpError, create_unknown_error};

mod east_money_service;
pub use east_money_service::EastMoneyService;

pub use http_service::MockHttpService;
