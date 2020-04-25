pub type Value = serde_json::Value;

pub enum Error {
    JsonFormatError(String),
    TypeMismatchError(String),
}

pub fn parse_json_string(raw_json: &String) -> Result<Value, Error> {
    match serde_json::from_str(raw_json) {
        Ok(object) => Ok(object),
        Err(_) => Err(Error::JsonFormatError(format!(
            "failed to parse json string {}",
            raw_json
        ))),
    }
}

pub fn deserialize_str(
    object: &Value,
    field: &str,
    error_message: String,
) -> Result<String, Error> {
    let raw_value = &object[field];
    match raw_value.as_str() {
        Some(value) => Ok(String::from(value)),
        None => Err(Error::TypeMismatchError(error_message)),
    }
}

pub fn deserialize_u64(object: &Value, field: &str, error_message: String) -> Result<u64, Error> {
    let raw_value = &object[field];
    match raw_value.as_u64() {
        Some(value) => Ok(value),
        None => Err(Error::TypeMismatchError(error_message)),
    }
}
