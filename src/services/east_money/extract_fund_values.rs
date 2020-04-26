use scraper::{Html, Selector};
use serde_json::Value;

use super::super::deserializer::{
    deserialize_str, deserialize_u64, parse_date_string, parse_f32_from_str, parse_json_string,
    DeserializationError, WrongPrefixError,
};
use crate::models::fund_value::{FundValueData, FundValueModel};
use crate::utils::context::FetchValueContext;

fn transfer_js_to_json(js: String, keys: Vec<&str>) -> String {
    let mut raw_json: String = js.to_string();
    for k in keys {
        raw_json = raw_json.replace(&format!("{}:", k), &format!("\"{}\":", k));
    }
    raw_json
}

fn parse_json(
    raw_response: &String,
    context: &FetchValueContext,
) -> Result<Value, Box<dyn DeserializationError>> {
    let prefix = "var apidata=";
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
    let raw_js = &raw_response[start_index..end_index];
    let raw_json = transfer_js_to_json(
        raw_js.to_string(),
        vec!["content", "records", "pages", "curpage"],
    );
    parse_json_string(&raw_json, context)
}

fn parse_values(
    html: &str,
    context: &FetchValueContext,
) -> Result<Vec<FundValueData>, Box<dyn DeserializationError>> {
    let fragment = Html::parse_fragment(html);
    let row_selector = Selector::parse("tr").unwrap();
    let cell_selector = Selector::parse("td").unwrap();
    let mut values: Vec<FundValueData> = vec![];
    for tr in fragment.select(&row_selector) {
        let cells = tr.select(&cell_selector).collect::<Vec<_>>();
        if cells.len() == 0 {
            continue;
        }
        if cells.len() < 4 {
            panic!("html content is not correct! {}", html);
        }
        let raw_date = cells[0].inner_html();
        let date = parse_date_string(&raw_date, "cells[0]", context)?;
        let raw_value = cells[2].inner_html();
        let value = parse_f32_from_str(&raw_value, "cells[2]", context)?;
        values.push(FundValueData {
            date,
            real_value: value,
        })
    }
    Ok(values)
}

pub fn extract_fund_values(
    raw_response: &String,
    context: &FetchValueContext,
) -> Result<FundValueModel, Box<dyn DeserializationError>> {
    let object = parse_json(&raw_response, context)?;
    let content = deserialize_str(&object["content"], "content", context)?;
    let records = deserialize_u64(&object["records"], "records", context)?;
    let curpage = deserialize_u64(&object["curpage"], "curpage", context)?;
    let pages = deserialize_u64(&object["pages"], "page", context)?;
    let values = parse_values(&content, context)?;
    Ok(FundValueModel {
        records,
        curpage,
        pages,
        values,
    })
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_deserialize_fund_value() {
        let raw_response = String::from(
            r#"var apidata={ content:"<table class='w782 comm lsjz'><thead><tr><th class='first'>净值日期</th><th>单位净值</th><th>累计净值</th><th>日增长率</th><th>申购状态</th><th>赎回状态</th><th class='tor last'>分红送配</th></tr></thead><tbody><tr><td>2020-04-24</td><td class='tor bold'>3.7510</td><td class='tor bold'>3.7510</td><td class='tor bold grn'>-1.16%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr><tr><td>2020-04-23</td><td class='tor bold'>3.7950</td><td class='tor bold'>3.7950</td><td class='tor bold grn'>-1.07%</td><td>开放申购</td><td>开放赎回</td><td class='red unbold'></td></tr></tbody></table>",records:2102,pages:211,curpage:1};"#,
        );
        let expected_fund_value_model = FundValueModel {
            curpage: 1,
            pages: 211,
            records: 2102,
            values: vec![
                FundValueData {
                    date: String::from("2020-04-24"),
                    real_value: 3.7510,
                },
                FundValueData {
                    date: String::from("2020-04-23"),
                    real_value: 3.7950,
                },
            ],
        };
        let context = FetchValueContext {
            id: String::from("id"),
            page: 0,
        };
        let maybe_model = extract_fund_values(&raw_response, &context);
        match maybe_model {
            Ok(model) => assert_eq!(model, expected_fund_value_model),
            Err(e) => panic!("{}", e),
        }
    }
    #[test]
    fn test_deserialize_fund_value_with_json_error() {
        let raw_response = String::from(
            r#"var apidata={ content:json content,records:2102,pages:211,curpage:1};"#,
        );
        let context = FetchValueContext {
            id: String::from("id"),
            page: 0,
        };
        let maybe_model = extract_fund_values(&raw_response, &context);
        match maybe_model {
            Ok(_) => panic!("it should fail"),
            Err(e) => assert!(e.is_json_error()),
        }
    }
    #[test]
    fn test_deserialize_fund_value_with_type_error() {
        let raw_response = String::from(
            r#"var apidata={ content: "json content",records:"2102",pages:211,curpage:1};"#,
        );
        let context = FetchValueContext {
            id: String::from("id"),
            page: 0,
        };
        let maybe_model = extract_fund_values(&raw_response, &context);
        match maybe_model {
            Ok(_) => panic!("it should fail"),
            Err(e) => assert!(e.is_type_error()),
        }
    }
    #[test]
    fn test_deserialize_fund_value_with_wrong_response() {
        let raw_response = String::from("var _apidata={};");
        let context = FetchValueContext {
            id: String::from("id"),
            page: 0,
        };
        let maybe_model = extract_fund_values(&raw_response, &context);
        match maybe_model {
            Ok(_) => panic!("it should fail"),
            Err(e) => assert!(e.is_prefix_error()),
        }
    }
}
