use regex::Regex;
use std::error::Error;
use std::fmt::{Debug, Display, Formatter, Result as fmtResult};
type Value = serde_json::Value;

use crate::utils::context::Context;

#[derive(PartialEq)]
pub enum ErrorKind {
    Prefix,
    Json,
    Type,
}
pub trait DeserializationError: Error + 'static {
    fn get_type(&self) -> ErrorKind;
}

impl dyn DeserializationError {
    #[cfg(test)]
    pub fn is_json_error(&self) -> bool {
        self.get_type() == ErrorKind::Json
    }
    #[cfg(test)]
    pub fn is_prefix_error(&self) -> bool {
        self.get_type() == ErrorKind::Prefix
    }
    #[cfg(test)]
    pub fn is_type_error(&self) -> bool {
        self.get_type() == ErrorKind::Type
    }
}

#[derive(Debug)]
pub struct JsonFormatError {
    context: String,
}
impl Display for JsonFormatError {
    fn fmt(&self, f: &mut Formatter) -> fmtResult {
        write!(
            f,
            "failed to parse json string. Context: '{}'",
            self.context
        )
    }
}
impl Error for JsonFormatError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        None
    }
}
impl DeserializationError for JsonFormatError {
    fn get_type(&self) -> ErrorKind {
        ErrorKind::Json
    }
}

#[derive(Debug)]
pub struct WrongPrefixError {
    pub prefix: String,
    pub context: String,
}
impl Display for WrongPrefixError {
    fn fmt(&self, f: &mut Formatter) -> fmtResult {
        write!(
            f,
            "prefix is wrong, expected to be '{}'. Context: '{}'",
            self.prefix, self.context
        )
    }
}
impl Error for WrongPrefixError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        None
    }
}
impl DeserializationError for WrongPrefixError {
    fn get_type(&self) -> ErrorKind {
        ErrorKind::Prefix
    }
}

#[derive(Debug)]
pub struct TypeMismatchError {
    pub expected_type: String,
    pub got: String,
    pub field: String,
    pub context: String,
}
impl Display for TypeMismatchError {
    fn fmt(&self, f: &mut Formatter) -> fmtResult {
        write!(
            f,
            "Expect '{}' for field '{}', got '{}'. Context: '{}'",
            self.expected_type, self.field, self.got, self.context
        )
    }
}
impl Error for TypeMismatchError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        None
    }
}
impl DeserializationError for TypeMismatchError {
    fn get_type(&self) -> ErrorKind {
        ErrorKind::Type
    }
}

pub fn parse_json_string(
    raw_json: &String,
    context: &dyn Context,
) -> Result<Value, Box<dyn DeserializationError>> {
    match serde_json::from_str(raw_json) {
        Ok(object) => Ok(object),
        Err(_) => Err(Box::new(JsonFormatError {
            context: format!("{}", context),
        })),
    }
}

pub fn deserialize_str(
    raw_value: &Value,
    field: &str,
    context: &dyn Context,
) -> Result<String, Box<dyn DeserializationError>> {
    match raw_value.as_str() {
        Some(value) => Ok(value.to_string()),
        None => Err(Box::new(TypeMismatchError {
            expected_type: String::from("string"),
            got: format!("{}", raw_value),
            field: field.to_string(),
            context: format!("{}", context),
        })),
    }
}

pub fn deserialize_u64(
    raw_value: &Value,
    field: &str,
    context: &dyn Context,
) -> Result<u64, Box<dyn DeserializationError>> {
    match raw_value.as_u64() {
        Some(value) => Ok(value),
        None => Err(Box::new(TypeMismatchError {
            expected_type: String::from("u64"),
            got: format!("{}", raw_value),
            field: field.to_string(),
            context: format!("{}", context),
        })),
    }
}

pub fn deserialize_array<'a>(
    object: &'a Value,
    field: &str,
    context: &dyn Context,
) -> Result<&'a Vec<Value>, Box<dyn DeserializationError>> {
    match object.as_array() {
        Some(arr) => Ok(arr),
        None => Err(Box::new(TypeMismatchError {
            expected_type: String::from("array"),
            got: format!("{}", object),
            field: field.to_string(),
            context: format!("{}", context),
        })),
    }
}

pub fn parse_f32_from_str(
    string: &str,
    field: &str,
    context: &dyn Context,
) -> Result<f32, Box<dyn DeserializationError>> {
    match string.parse::<f32>() {
        Ok(val) => Ok(val),
        Err(_) => Err(Box::new(TypeMismatchError {
            expected_type: String::from("float32"),
            got: string.to_string(),
            field: field.to_string(),
            context: format!("{}", context),
        })),
    }
}

// date_string is assumed to be in yyyy-mm-dd
pub fn parse_date_string(
    date_string: &str,
    field: &str,
    context: &dyn Context,
) -> Result<String, Box<dyn DeserializationError>> {
    let re = Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap();
    if re.is_match(date_string) {
        Ok(date_string.to_string())
    } else {
        Err(Box::new(TypeMismatchError {
            expected_type: String::from("yyyy-mm-dd"),
            got: date_string.to_string(),
            field: field.to_string(),
            context: format!("{}", context),
        }))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::utils::context::DummyContext;

    const CONTEXT: DummyContext = DummyContext {};

    #[test]
    fn test_parse_f32_from_str_pass() {
        let result = parse_f32_from_str("1.2150", "field", &CONTEXT);
        match result {
            Ok(num) => assert_eq!(num, 1.2150),
            Err(_) => panic!("It should be parsed without error"),
        }
    }

    #[test]
    fn test_parse_f32_from_str_fail() {
        let result = parse_f32_from_str("s1.2150", "number", &CONTEXT);
        match result {
            Ok(_) => panic!("It should not pass"),
            Err(e) => assert_eq!(
                format!("{}", e),
                "Expect 'float32' for field 'number', got 's1.2150'. Context: 'dummy context'"
            ),
        }
    }

    #[test]
    fn test_parse_date_string_pass() {
        let result = parse_date_string("1999-02-04", "birthday", &CONTEXT);
        match result {
            Ok(date) => assert_eq!(date, "1999-02-04"),
            Err(_) => panic!("It should parse date string correctly"),
        }
    }

    #[test]
    fn test_parse_date_string_fail() {
        let result = parse_date_string("19999-02-04", "birthday", &CONTEXT);
        match result {
            Ok(_) => panic!("It should not pass"),
            Err(e) => assert_eq!(
                format!("{}", e),
                "Expect 'yyyy-mm-dd' for field 'birthday', got '19999-02-04'. Context: 'dummy context'"
            ),
        }
    }
}
