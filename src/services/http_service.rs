use reqwest;

pub struct HttpService {}

impl HttpService {
    pub fn new() -> HttpService {
        HttpService {}
    }

    pub async fn get(&self, url: &str) -> Result<String, reqwest::Error> {
        let response = reqwest::get(url).await;
        match response {
            Ok(result) => result.text().await,
            Err(e) => Err(e),
        }
    }
}
