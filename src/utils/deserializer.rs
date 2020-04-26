use regex::Regex;
use std::error::Error;
use std::fmt::{Debug, Display, Formatter, Result as fmtResult};

use crate::utils::context::Context;

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

pub fn parse_f32_from_str(
    string: &str,
    field: &str,
    context: &dyn Context,
) -> Result<f32, TypeMismatchError> {
    match string.parse::<f32>() {
        Ok(val) => Ok(val),
        Err(_) => Err(TypeMismatchError {
            expected_type: String::from("float32"),
            got: string.to_string(),
            field: field.to_string(),
            context: format!("{}", context),
        }),
    }
}

pub fn parse_usize_from_str(
    string: &str,
    field: &str,
    context: &dyn Context,
) -> Result<usize, TypeMismatchError> {
    match string.parse::<usize>() {
        Ok(val) => Ok(val),
        Err(_) => Err(TypeMismatchError {
            expected_type: String::from("usize"),
            got: string.to_string(),
            field: field.to_string(),
            context: format!("{}", context),
        }),
    }
}

// date_string is assumed to be in yyyy-mm-dd
pub fn parse_date_string(
    date_string: &str,
    field: &str,
    context: &dyn Context,
) -> Result<String, TypeMismatchError> {
    let re = Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap();
    if re.is_match(date_string) {
        Ok(date_string.to_string())
    } else {
        Err(TypeMismatchError {
            expected_type: String::from("yyyy-mm-dd"),
            got: date_string.to_string(),
            field: field.to_string(),
            context: format!("{}", context),
        })
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
