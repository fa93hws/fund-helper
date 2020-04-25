use async_trait::async_trait;
use mockall::mock;
use reqwest;

pub struct HttpService {}
impl HttpService {
    pub fn new() -> HttpService {
        HttpService {}
    }
}

#[async_trait]
pub trait IHttpService {
    async fn get(&self, url: &str) -> Result<String, HttpError>;
}

async fn unwrap_body(url: &str) -> Result<String, reqwest::Error> {
    let text = reqwest::get(url).await?.text().await?;
    Ok(text)
}

#[async_trait]
impl IHttpService for HttpService {
    async fn get(&self, url: &str) -> Result<String, HttpError> {
        let body = unwrap_body(url).await;
        match body {
            Ok(result) => Ok(result),
            Err(_) => Err(create_unknown_error(None)),
        }
    }
}

mock! {
    pub HttpService {
        fn sync_get(&self, url: &str) -> Result<String, HttpError>;
    }

    trait Clone {
        fn clone(&self) -> Self;
    }
}

#[derive(Clone)]
pub enum ErrorKind {
    UnknownError,
}
#[derive(Clone)]
pub struct HttpError {
    kind: ErrorKind,
    msg: String,
}
pub fn create_unknown_error(maybe_message: Option<&str>) -> HttpError {
    let message = match maybe_message {
        Some(msg) => msg,
        None => "Unknown http error",
    };
    HttpError {
        kind: ErrorKind::UnknownError,
        msg: message.to_string(),
    }
}
