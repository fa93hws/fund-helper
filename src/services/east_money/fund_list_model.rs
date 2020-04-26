use super::super::deserializer::{
    deserialize_array, deserialize_str, parse_json_string, DeserializationError, TypeMismatchError,
    WrongPrefixError,
};
use crate::utils::context::FetchListContext;
use serde_json::Value;

#[derive(Debug, PartialEq)]
pub struct FundListItem {
    id: String,
    name: String,
}

pub type FundList = Vec<FundListItem>;

fn parse_json(
    raw_response: &String,
    context: &FetchListContext,
) -> Result<Value, Box<dyn DeserializationError>> {
    let prefix = "var r = ";
    let start_index: usize;

    match raw_response.find(prefix) {
        Some(start) => start_index = start + prefix.len(),
        None => {
            return Err(Box::new(WrongPrefixError {
                prefix: prefix.to_string(),
                context: format!("{}", context),
            }))
        }
    }

    let end_index = raw_response.len() - 1;
    let raw_json = String::from(&raw_response[start_index..end_index]);
    parse_json_string(&raw_json, context)
}

pub fn extract_fund_list(
    raw_response: &String,
    context: &FetchListContext,
) -> Result<FundList, Box<dyn DeserializationError>> {
    let result = parse_json(raw_response, context)?;
    let raw_list = deserialize_array(&result, "root", context)?;
    let mut list: FundList = vec![];
    for raw_tup in raw_list {
        let tup = deserialize_array(raw_tup, "first level item", context)?;
        if tup.len() != 5 {
            return Err(Box::new(TypeMismatchError {
                expected_type: String::from("arr(len = 5)"),
                got: format!("{}", raw_tup),
                field: String::from(""),
                context: format!("{}", context),
            }));
        }
        let id = deserialize_str(&tup[0], "0(fund-id)", context)?;
        let name = deserialize_str(&tup[2], "2(fund-name)", context)?;
        list.push(FundListItem { id, name });
    }

    Ok(list)
}

#[cfg(test)]
mod test {
    use super::*;
    const CONTEXT: FetchListContext = FetchListContext {};

    #[test]
    fn test_extract_fund_list_pass() {
        let raw_response = r#"var r = [["000001","HXCZHH","华夏成长混合","混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        let expected_fund_list = vec![
            FundListItem {
                id: String::from("000001"),
                name: String::from("华夏成长混合"),
            },
            FundListItem {
                id: String::from("000002"),
                name: String::from("华夏成长混合(后端)"),
            },
        ];
        match extract_fund_list(&String::from(raw_response), &CONTEXT) {
            Ok(fund_list) => assert_eq!(fund_list, expected_fund_list),
            Err(_) => panic!("It should be parsed correctly"),
        }
    }

    #[test]
    fn test_extract_fund_list_wrong_id() {
        let raw_response = r#"var r = [[1,"HXCZHH","华夏成长混合","混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        match extract_fund_list(&String::from(raw_response), &CONTEXT) {
            Ok(_) => panic!("It should not be parsed correctly"),
            Err(e) => assert!(e.is_type_error()),
        }
    }

    #[test]
    fn test_extract_fund_list_wrong_name() {
        let raw_response = r#"var r = [["000001","HXCZHH",123,"混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        match extract_fund_list(&String::from(raw_response), &CONTEXT) {
            Ok(_) => panic!("It should not be parsed correctly"),
            Err(e) => assert!(e.is_type_error()),
        }
    }

    #[test]
    fn test_extract_fund_list_wrong_prefix() {
        let raw_response = r#"var rr = [["000001","HXCZHH",123,"混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        match extract_fund_list(&String::from(raw_response), &CONTEXT) {
            Ok(_) => panic!("It should not be parsed correctly"),
            Err(e) => assert!(e.is_prefix_error()),
        }
    }
}
