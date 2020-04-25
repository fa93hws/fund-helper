use super::super::deserializer::{deserialize_str, deserialize_u64, parse_json_string, Error};
use serde_json::Value;

fn transfer_js_to_json(js: String, keys: Vec<&str>) -> String {
    let mut raw_json: String = String::from(js);
    for k in keys {
        raw_json = raw_json.replace(&format!("{}:", k), &format!("\"{}\":", k));
    }
    raw_json
}

pub struct FundValueModel {
    pub content: String,
    pub records: u64,
    pub curpage: u64,
    pub pages: u64,
}

fn parse_json(raw_response: &String) -> Result<Value, Error> {
    let prefix = "var apidata=";
    let start_index = prefix.len();
    if &raw_response[..start_index] != prefix {
        return Err(Error::JsonFormatError(String::from(
            "prefix string is not var apidata=",
        )));
    }
    let end_index = raw_response.len() - 1;
    let raw_js = &raw_response[start_index..end_index];
    let raw_json = transfer_js_to_json(
        String::from(raw_js),
        vec!["content", "records", "pages", "curpage"],
    );
    parse_json_string(&raw_json)
}

fn build_type_error(typ: &str, field: &str, raw_value: &Value) -> String {
    format!("Expect {} for {}, but got {}", typ, field, raw_value)
}

pub fn extract_fund_value(raw_response: String) -> Result<FundValueModel, Error> {
    let object = parse_json(&raw_response)?;
    let content = deserialize_str(
        &object,
        "content",
        build_type_error("string", "content", &object["content"]),
    )?;
    let records = deserialize_u64(
        &object,
        "records",
        build_type_error("u64", "records", &object["records"]),
    )?;
    let curpage = deserialize_u64(
        &object,
        "curpage",
        build_type_error("u64", "curpage", &object["curpage"]),
    )?;
    let pages = deserialize_u64(
        &object,
        "pages",
        build_type_error("u64", "pages", &object["pages"]),
    )?;
    Ok(FundValueModel {
        content,
        records,
        curpage,
        pages,
    })
}

#[cfg(test)]
mod test {
    use super::*;
    #[test]
    fn test_deserialize_fund_value() {
        let raw_response = String::from(
            r#"var apidata={ content:"json content",records:2102,pages:211,curpage:1};"#,
        );
        let maybe_model = extract_fund_value(raw_response);
        match maybe_model {
            Ok(model) => {
                assert_eq!(model.content, "json content");
                assert_eq!(model.curpage, 1);
                assert_eq!(model.pages, 211);
                assert_eq!(model.records, 2102);
            }
            Err(e) => panic!(e),
        }
    }
    #[test]
    fn test_deserialize_fund_value_with_json_error() {
        let raw_response = String::from(
            r#"var apidata={ content:json content,records:2102,pages:211,curpage:1};"#,
        );
        let maybe_model = extract_fund_value(raw_response);
        match maybe_model {
            Ok(_) => panic!("it should fail"),
            Err(Error::JsonFormatError(_)) => (),
            _ => panic!("it should be failed with JsonFormatError"),
        }
    }
    #[test]
    fn test_deserialize_fund_value_with_type_error() {
        let raw_response = String::from(
            r#"var apidata={ content:"json content",records:"2102",pages:211,curpage:1};"#,
        );
        let maybe_model = extract_fund_value(raw_response);
        match maybe_model {
            Ok(_) => panic!("it should fail"),
            Err(Error::TypeMismatchError(_)) => (),
            _ => panic!("it should be failed with TypeMismatchError"),
        }
    }
    #[test]
    fn test_deserialize_fund_value_with_wrong_response() {
        let raw_response = String::from("var _apidata={};");
        let maybe_model = extract_fund_value(raw_response);
        match maybe_model {
            Ok(_) => panic!("it should fail"),
            Err(Error::JsonFormatError(_)) => (),
            _ => panic!("it should be failed with JsonFormatError"),
        }
    }
}
