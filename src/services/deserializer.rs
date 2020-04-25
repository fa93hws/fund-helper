use regex::Regex;
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

pub fn parse_f32_from_str(string: &str, error_message: String) -> Result<f32, Error> {
    match string.parse::<f32>() {
        Ok(val) => Ok(val),
        Err(_) => Err(Error::TypeMismatchError(error_message)),
    }
}

// date_string is assumed to be in yyyy-mm-dd
pub fn parse_date_string(date_string: &str, error_message: String) -> Result<String, Error> {
    let re = Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap();
    if re.is_match(date_string) {
        Ok(String::from(date_string))
    } else {
        Err(Error::TypeMismatchError(error_message))
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_parse_f32_from_str_pass() {
        let result = parse_f32_from_str("1.2150", String::from(""));
        match result {
            Ok(num) => assert_eq!(num, 1.2150),
            Err(_) => panic!("It should be parsed without error"),
        }
    }

    #[test]
    fn test_parse_f32_from_str_fail() {
        let result = parse_f32_from_str("s1.2150", String::from("not a number"));
        match result {
            Ok(_) => panic!("It should not pass"),
            Err(Error::TypeMismatchError(s)) => assert_eq!(s, "not a number"),
            _ => panic!("It should throw TypeMismatchError"),
        }
    }

    #[test]
    fn test_parse_date_string_pass() {
        let result = parse_date_string("1999-02-04", String::from(""));
        match result {
            Ok(date) => assert_eq!(date, "1999-02-04"),
            Err(_) => panic!("It should parse date string correctly"),
        }
    }

    #[test]
    fn test_parse_date_string_fail() {
        let result = parse_date_string("19999-02-04", String::from("not birthday!"));
        match result {
            Ok(_) => panic!("It should not pass"),
            Err(Error::TypeMismatchError(s)) => assert_eq!(s, "not birthday!"),
            _ => panic!("It should throw TypeMismatchError"),
        }
    }
}
