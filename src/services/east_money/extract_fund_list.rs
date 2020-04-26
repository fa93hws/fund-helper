use crate::models::fund_list::{FundList, FundListItem, FundType};
use crate::utils::context::FetchListContext;

fn normalize_fund_type(typ: &str, context: &FetchListContext) -> FundType {
    match typ {
        "混合型" | "混合-FOF" => FundType::Mix,
        "债券型" | "定开债券" | "债券指数" => FundType::Bond,
        "联接基金" | "股票指数" | "QDII-指数" | "ETF-场内" | "QDII-ETF" => {
            FundType::Index
        }
        "QDII" => FundType::QDII,
        "股票型" | "其他创新" | "股票-FOF" => FundType::Stock,
        "货币型" | "固定收益" | "理财型" | "分级杠杆" | "保本型" => {
            FundType::NotInterested
        }
        _ => panic!("Unknown fund type, got 'typ'. Context: {}", context),
    }
}

fn parse_json<'a>(
    raw_response: &'a String,
    context: &FetchListContext,
) -> Vec<(&'a str, &'a str, &'a str, &'a str, &'a str)> {
    let prefix = "var r = ";
    let start_index: usize;

    match raw_response.find(prefix) {
        Some(start) => start_index = start + prefix.len(),
        None => panic!("Wrong prefix, expected 'var r = '. Context: {}", context),
    }

    let end_index = raw_response.len() - 1;
    let raw_json: &'a str = &raw_response[start_index..end_index];
    serde_json::from_str::<'a, Vec<(&'a str, &'a str, &'a str, &'a str, &'a str)>>(raw_json)
        .expect(&format!("wrong json format. Context: {}", context))
}

pub(super) fn extract_fund_list<'a>(raw_response: &String, context: &FetchListContext) -> FundList {
    let raw_list = parse_json(raw_response, context);
    let mut list: FundList = vec![];
    for tup in raw_list {
        let typ_enum = normalize_fund_type(tup.3, context);
        list.push(FundListItem {
            id: tup.0.to_string(),
            name: tup.2.to_string(),
            typ: typ_enum,
        });
    }
    list
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
                typ: FundType::Mix,
            },
            FundListItem {
                id: String::from("000002"),
                name: String::from("华夏成长混合(后端)"),
                typ: FundType::Mix,
            },
        ];
        let fund_list = extract_fund_list(&String::from(raw_response), &CONTEXT);
        assert_eq!(fund_list, expected_fund_list);
    }

    #[test]
    #[should_panic]
    fn test_extract_fund_list_wrong_id() {
        let raw_response = r#"var r = [[1,"HXCZHH","华夏成长混合","混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        extract_fund_list(&String::from(raw_response), &CONTEXT);
    }

    #[test]
    #[should_panic]
    fn test_extract_fund_list_wrong_name() {
        let raw_response = r#"var r = [["000001","HXCZHH",123,"混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        extract_fund_list(&String::from(raw_response), &CONTEXT);
    }

    #[test]
    #[should_panic]
    fn test_extract_fund_list_wrong_prefix() {
        let raw_response = r#"var rr = [["000001","HXCZHH",123,"混合型","HUAXIACHENGZHANGHUNHE"],["000002","HXCZHH","华夏成长混合(后端)","混合型","HUAXIACHENGZHANGHUNHE"]];"#;
        extract_fund_list(&String::from(raw_response), &CONTEXT);
    }

    #[test]
    fn test_normalize_fund_type_mixed() {
        let typ = String::from("混合型");
        let typ_enum = normalize_fund_type(&typ, &CONTEXT);
        assert_eq!(typ_enum, FundType::Mix);
    }

    #[test]
    fn test_normalize_fund_type_bond() {
        let typ = String::from("债券型");
        let typ_enum = normalize_fund_type(&typ, &CONTEXT);
        assert_eq!(typ_enum, FundType::Bond);
    }

    #[test]
    fn test_normalize_fund_type_index() {
        let typ = String::from("股票指数");
        let typ_enum = normalize_fund_type(&typ, &CONTEXT);
        assert_eq!(typ_enum, FundType::Index);
    }

    #[test]
    fn test_normalize_fund_type_stock() {
        let typ = String::from("股票型");
        let typ_enum = normalize_fund_type(&typ, &CONTEXT);
        assert_eq!(typ_enum, FundType::Stock);
    }

    #[test]
    fn test_normalize_fund_type_others() {
        let typ = String::from("理财型");
        let typ_enum = normalize_fund_type(&typ, &CONTEXT);
        assert_eq!(typ_enum, FundType::NotInterested);
    }

    #[test]
    #[should_panic]
    fn test_normalize_fund_type_error() {
        let typ = String::from("顾茗");
        normalize_fund_type(&typ, &CONTEXT);
    }
}
