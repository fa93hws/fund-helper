use super::http_service::IHttpService;

pub struct EastMoneyService<'a> {
    base_url: String,
    http_service: &'a dyn IHttpService,
}

impl EastMoneyService<'_> {
    pub fn new(http_service: &dyn IHttpService) -> EastMoneyService {
        EastMoneyService {
            http_service,
            base_url: String::from("http://fund.eastmoney.com"),
        }
    }
}

impl EastMoneyService<'_> {
    pub async fn fetch_value(&self, id: &str) -> String {
        let url = format!(
            "{}{}{}",
            self.base_url, "/f10/F10DataApi.aspx?type=lsjz&code=", id
        );
        let http_result = self.http_service.get(&url).await;
        match http_result {
            Ok(result) => result,
            Err(_) => panic!(format!("failed to fetch url {}", url)),
        }
    }
}

#[cfg(test)]
mod tests {
    extern crate reqwest;

    use async_trait::async_trait;
    use futures::executor::block_on;
    use std::sync::{Arc, Mutex};

    use super::super::{create_unknown_error, HttpError, IHttpService, MockHttpService};
    use super::EastMoneyService;

    #[async_trait]
    impl IHttpService for MockHttpService {
        async fn get(&self, url: &str) -> Result<String, HttpError> {
            self.sync_get(url)
        }
    }

    const FUND_ID: &str = "000123";

    #[test]
    fn test_fetch_success() {
        let mut mock = MockHttpService::new();
        let expect_url = "http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=000123";
        let got_url_arc = Arc::new(Mutex::new(String::default()));
        let got_url_arc_clone = Arc::clone(&got_url_arc);
        mock.expect_sync_get().returning(move |url| {
            let mut data = got_url_arc_clone.lock().unwrap();
            *data = url.to_string();
            Ok(String::default())
        });

        let east_money_service = EastMoneyService::new(&mock);
        block_on(east_money_service.fetch_value(FUND_ID));
        assert_eq!(*got_url_arc.lock().unwrap(), expect_url);
    }

    #[test]
    #[should_panic(
        expected = "failed to fetch url http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=000123"
    )]
    fn test_fetch_fail() {
        let mut mock = MockHttpService::new();
        let err = create_unknown_error(None);
        mock.expect_sync_get().return_const(Err(err));
        let east_money_service = EastMoneyService::new(&mock);
        block_on(east_money_service.fetch_value(FUND_ID));
    }
}
