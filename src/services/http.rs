use reqwest::blocking;
use reqwest::Error;

pub struct HttpService {
}
impl HttpService {
    pub fn new() -> HttpService {
        HttpService {}
    }
}

pub trait CanGetHTTP {
    fn get(&self, url: &str) -> Result<String, HttpError>;
}

fn unwrap_body(url: &str) -> Result<String, Error> {
    let text = blocking::get(url)?.text()?;
    Ok(text)
}

impl CanGetHTTP for HttpService {
    fn get(&self, url: &str) -> Result<String, HttpError> {
        let body = unwrap_body(url);
        match body {
            Ok(result) => Ok(result),
            Err(_) => {
                println!("error!");
                Err(create_unknown_error(None))
            }
        }
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
