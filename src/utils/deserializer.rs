use std::error::Error;
use std::fmt::{Debug, Display, Formatter, Result as fmtResult};
use chrono::NaiveDate;

#[derive(Debug)]
pub struct TypeMismatchError {
    pub expected_type: String,
    pub got: String,
}
impl Display for TypeMismatchError {
    fn fmt(&self, f: &mut Formatter) -> fmtResult {
        write!(
            f,
            "Expect type '{}' but got '{}'.",
            self.expected_type, self.got,
        )
    }
}
impl Error for TypeMismatchError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        None
    }
}

pub fn parse_f32_from_str(string: &str) -> Result<f32, TypeMismatchError> {
    match string.parse::<f32>() {
        Ok(val) => Ok(val),
        Err(_) => Err(TypeMismatchError {
            expected_type: String::from("float32"),
            got: string.to_string(),
        }),
    }
}

pub fn parse_usize_from_str(string: &str) -> Result<usize, TypeMismatchError> {
    match string.parse::<usize>() {
        Ok(val) => Ok(val),
        Err(_) => Err(TypeMismatchError {
            expected_type: String::from("usize"),
            got: string.to_string(),
        }),
    }
}

// date_string is assumed to be in yyyy-mm-dd
pub fn parse_date_string(date_string: &str) -> Result<i64, TypeMismatchError> {
    match NaiveDate::parse_from_str(date_string, "%Y-%m-%d") {
        Ok(date) => Ok(date.and_hms(0, 0, 0).timestamp()),
        Err(_) => Err(TypeMismatchError {
            expected_type: String::from("yyyy-mm-dd"),
            got: date_string.to_string(),
        }),
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_parse_f32_from_str_pass() {
        let result = parse_f32_from_str("1.2150");
        match result {
            Ok(num) => assert_eq!(num, 1.2150),
            Err(_) => panic!("It should be parsed without error"),
        }
    }

    #[test]
    fn test_parse_f32_from_str_fail() {
        let result = parse_f32_from_str("s1.2150");
        match result {
            Ok(_) => panic!("It should not pass"),
            Err(e) => assert_eq!(format!("{}", e), "Expect type 'float32' but got 's1.2150'."),
        }
    }

    #[test]
    fn test_parse_date_string_pass() {
        let result = parse_date_string("1999-02-04");
        match result {
            Ok(date) => assert_eq!(date, 918086400),
            Err(_) => panic!("It should parse date string correctly"),
        }
    }

    #[test]
    fn test_parse_date_string_fail() {
        let result = parse_date_string("19999-02-04");
        match result {
            Ok(_) => panic!("It should not pass"),
            Err(e) => assert_eq!(
                format!("{}", e),
                "Expect type 'yyyy-mm-dd' but got '19999-02-04'."
            ),
        }
    }
}
