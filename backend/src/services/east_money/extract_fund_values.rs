use scraper::{Html, Selector};
use serde::Deserialize;

use crate::models::fund_value::FundValueData;
use crate::utils::context::FetchValueContext;
use crate::utils::deserializer::{parse_date_string, parse_f32_from_str};

#[derive(Debug, Deserialize)]
struct RawJsonResponse {
    content: String,
    records: usize,
    pages: usize,
    curpage: usize,
}

#[derive(Debug, PartialEq)]
pub struct FundValueResponse {
    pub records: usize,
    pub curpage: usize,
    pub pages: usize,
    pub values: Vec<FundValueData>,
}

fn transfer_js_to_json(js: String, keys: Vec<&str>) -> String {
    let mut raw_json: String = js.to_string();
    for k in keys {
        raw_json = raw_json.replace(&format!("{}:", k), &format!("\"{}\":", k));
    }
    raw_json
}

fn parse_json(raw_response: &String, context: &FetchValueContext) -> RawJsonResponse {
    let prefix = "var apidata=";
    let start_index: usize;

    match raw_response.find(prefix) {
        Some(start) => start_index = start + prefix.len(),
        None => panic!(
            "prefix is wrong, expect 'var apidata='. Context: {}",
            context
        ),
    }

    let end_index = raw_response.len() - 1;
    let raw_js = &raw_response[start_index..end_index];
    let raw_json = transfer_js_to_json(
        raw_js.to_string(),
        vec!["content", "records", "pages", "curpage"],
    );
    serde_json::from_str::<RawJsonResponse>(&raw_json)
        .expect(&format!("Failed to deserialize json. Context: {}", context))
}

fn parse_values(html: &str, context: &FetchValueContext) -> Vec<FundValueData> {
    let fragment = Html::parse_fragment(html);
    let row_selector = Selector::parse("tr").unwrap();
    let cell_selector = Selector::parse("td").unwrap();
    let mut values: Vec<FundValueData> = vec![];
    let rows: Vec<scraper::element_ref::ElementRef> = fragment.select(&row_selector).collect();
    if rows.len() < 2 {
        panic!("Less than 2 tr found in html. Context: {}", context);
    }
    for tr in rows {
        let cells = tr.select(&cell_selector).collect::<Vec<_>>();
        if cells.len() == 0 {
            continue;
        }
        if cells.len() < 4 {
            panic!("html content is not correct! {}", html);
        }
        let raw_date = cells[0].inner_html();
        let date =
            parse_date_string(&raw_date).expect(&format!("@cells[0](date), context: {}", context));
        let raw_value = cells[2].inner_html();
        let value = parse_f32_from_str(&raw_value)
            .expect(&format!("@cells[2](value), context: {}", context));
        values.push(FundValueData {
            // The market closed at 3 P.M. Time zone is GMT + 8
            date: date.and_hms(7, 0, 0),
            real_value: value,
        })
    }
    values
}

pub(super) fn extract_fund_values(
    raw_response: &String,
    context: &FetchValueContext,
) -> FundValueResponse {
    let raw_json_response = parse_json(&raw_response, context);
    let html_content = raw_json_response.content;
    let values = parse_values(&html_content, context);
    FundValueResponse {
        records: raw_json_response.records,
        curpage: raw_json_response.curpage,
        pages: raw_json_response.pages,
        values,
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use chrono::NaiveDate;

    #[test]
    fn test_deserialize_fund_value() {
        let raw_response = String::from(
            r#"var apidata={ content:"<table class='w782 comm lsjz'><thead><tr><th class='first'>净值日期</th><th>单位净值</th><th>累计净值</th><th>日增长率</th><th>申购状态</th><th>赎回状态</th><th class='tor last'>分红送配</th></tr></thead><tbody><tr><td>2020-04-24</td><td class='tor bold'>3.7510</td><td class='tor bold'>3.7510</td><td class='tor bold grn'>-1.16%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr><tr><td>2020-04-23</td><td class='tor bold'>3.7950</td><td class='tor bold'>3.7950</td><td class='tor bold grn'>-1.07%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr></tbody></table>",records:2102,pages:211,curpage:1};"#,
        );
        let expected_fund_value_model = FundValueResponse {
            curpage: 1,
            pages: 211,
            records: 2102,
            values: vec![
                FundValueData {
                    date: NaiveDate::from_ymd(2020, 04, 24).and_hms(7, 0, 0),
                    real_value: 3.7510,
                },
                FundValueData {
                    date: NaiveDate::from_ymd(2020, 04, 23).and_hms(7, 0, 0),
                    real_value: 3.7950,
                },
            ],
        };
        let context = FetchValueContext {
            id: String::from("id"),
            page: 0,
        };
        let model = extract_fund_values(&raw_response, &context);
        assert_eq!(model, expected_fund_value_model);
    }

    #[test]
    #[should_panic(
        expected = "Failed to deserialize json. Context: command: fetch fund value. fund-id: id, page-number: 0"
    )]
    fn test_deserialize_fund_value_with_json_error() {
        let raw_response = String::from(
            r#"var apidata={ content:json content,records:2102,pages:211,curpage:1};"#,
        );
        let context = FetchValueContext {
            id: String::from("id"),
            page: 0,
        };
        extract_fund_values(&raw_response, &context);
    }

    #[test]
    #[should_panic(
        expected = "Failed to deserialize json. Context: command: fetch fund value. fund-id: id, page-number: 0"
    )]
    fn test_deserialize_fund_value_with_type_error() {
        let raw_response = String::from(
            r#"var apidata={ content: "json content",records:"2102",pages:211,curpage:1};"#,
        );
        let context = FetchValueContext {
            id: String::from("id"),
            page: 0,
        };
        extract_fund_values(&raw_response, &context);
    }

    #[test]
    #[should_panic(
        expected = "Less than 2 tr found in html. Context: command: fetch fund value. fund-id: id, page-number: 0"
    )]
    fn test_deserialize_fund_value_with_wrong_html() {
        let raw_response = String::from(
            r#"var apidata={ content: "json content",records:2102,pages:211,curpage:1};"#,
        );
        let context = FetchValueContext {
            id: String::from("id"),
            page: 0,
        };
        extract_fund_values(&raw_response, &context);
    }

    #[test]
    #[should_panic(
        expected = "prefix is wrong, expect 'var apidata='. Context: command: fetch fund value. fund-id: id, page-number: 0"
    )]
    fn test_deserialize_fund_value_with_wrong_response() {
        let raw_response = String::from("var _apidata={};");
        let context = FetchValueContext {
            id: String::from("id"),
            page: 0,
        };
        extract_fund_values(&raw_response, &context);
    }
}
