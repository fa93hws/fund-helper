use super::super::deserializer::{parse_json_string,deserialize_array,deserialize_str,Error};
use serde_json::Value;

#[derive(Debug, PartialEq)]
pub struct FundListItem {
    id: String,
    name: String,
}

pub type FundList = Vec<FundListItem>;

fn parse_json(raw_response: &String) -> Result<Value, Error> {
    let prefix = "var r = ";
    let start_index: usize;

    match raw_response.find(prefix) {
        Some(start) => start_index = start + prefix.len(),
        None => return Err(Error::JsonFormatError(String::from(
            "prefix string is not var r = ",
        ))),
    }

    let end_index = raw_response.len() - 1;
    let raw_json = String::from(&raw_response[start_index..end_index]);
    parse_json_string(&raw_json)
}

pub fn extract_fund_list(raw_response: &String) -> Result<FundList, Error> {
    let result = parse_json(raw_response)?;
    let raw_list = deserialize_array(
        &result,
        format!("Expect array for fund list, got {}", raw_response),
    )?;
    let mut list: FundList = vec![];
    for raw_tup in raw_list {
        let tup = deserialize_array(
            raw_tup,
            format!("Expect array for fund list item, got {}", raw_tup),
        )?;
        if tup.len() != 5 {
            return Err(Error::TypeMismatchError(
                format!("Expect fund list item to have 5 items, got {}", raw_tup)
            ));
        }
        let id = deserialize_str(
            &tup[0],
            format!("Expect first item of fund list item (fund-id) to be string, got {}", tup[0]),
        )?;
        let name = deserialize_str(
            &tup[2],
            format!("Expect third item of fund list item (fund-name) to be string, got {}", tup[2]),
        )?;
        list.push(FundListItem { id, name });
    }

    Ok(list)
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_extract_fund_list_pass() {
        let raw_response = r#"var r = [["000001","HXCZHH","华夏成长混合","混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        let expected_fund_list = vec![
            FundListItem {
                id: String::from("000001"),
                name: String::from("华夏成长混合")
            },
            FundListItem {
                id: String::from("000002"),
                name: String::from("华夏成长混合(后端)"),
            },
        ];
        match extract_fund_list(&String::from(raw_response)) {
            Ok(fund_list) => assert_eq!(fund_list, expected_fund_list),
            Err(_) => panic!("It should be parsed correctly"),
        }
    }

    #[test]
    fn test_extract_fund_list_wrong_id() {
        let raw_response = r#"var r = [[1,"HXCZHH","华夏成长混合","混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        match extract_fund_list(&String::from(raw_response)) {
            Ok(_) => panic!("It should not be parsed correctly"),
            Err(Error::TypeMismatchError(s)) => assert!(s.contains("fund-id")),
            _ => panic!("It should throw TypeMismatchError"),
        }
    }

    #[test]
    fn test_extract_fund_list_wrong_name() {
        let raw_response = r#"var r = [["000001","HXCZHH",123,"混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        match extract_fund_list(&String::from(raw_response)) {
            Ok(_) => panic!("It should not be parsed correctly"),
            Err(Error::TypeMismatchError(s)) => assert!(s.contains("fund-name")),
            _ => panic!("It should throw TypeMismatchError"),
        }
    }
}
