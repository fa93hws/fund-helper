use super::http_service::HttpService;

pub struct EastMoneyService<'a> {
    base_url: String,
    http_service: &'a HttpService,
}

impl EastMoneyService<'_> {
    pub fn new(http_service: &HttpService) -> EastMoneyService {
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
mod tests {}
