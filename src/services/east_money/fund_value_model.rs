use super::super::deserializer::{
    deserialize_str, deserialize_u64, parse_date_string, parse_f32_from_str, parse_json_string,
    Error,
};
use scraper::{Html, Selector};
use serde_json::Value;

fn transfer_js_to_json(js: String, keys: Vec<&str>) -> String {
    let mut raw_json: String = String::from(js);
    for k in keys {
        raw_json = raw_json.replace(&format!("{}:", k), &format!("\"{}\":", k));
    }
    raw_json
}

#[derive(Debug, PartialEq)]
pub struct FundValueData {
    pub date: String,
    pub real_value: f32,
}

#[derive(Debug, PartialEq)]
pub struct FundValueModel {
    pub records: u64,
    pub curpage: u64,
    pub pages: u64,
    pub values: Vec<FundValueData>,
}

fn parse_json(raw_response: &String) -> Result<Value, Error> {
    let prefix = "var apidata=";
    let start_index: usize;

    match raw_response.find(prefix) {
        Some(start) => start_index = start + prefix.len(),
        None => {
            return Err(Error::JsonFormatError(format!(
                "prefix string is {}",
                prefix
            )))
        }
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

fn parse_values(html: &str) -> Result<Vec<FundValueData>, Error> {
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
        let date = parse_date_string(
            &raw_date,
            format!(
                "expect yyyy-mm-dd for cells[0], got {}, html is {}",
                raw_date, html
            ),
        )?;
        let raw_value = cells[2].inner_html();
        let value = parse_f32_from_str(
            &raw_value,
            format!(
                "expect f32 for cells[2], got {}, html is {}",
                raw_value, html
            ),
        )?;
        values.push(FundValueData {
            date,
            real_value: value,
        })
    }
    Ok(values)
}

pub fn extract_fund_value(raw_response: &String) -> Result<FundValueModel, Error> {
    let object = parse_json(&raw_response)?;
    let content = deserialize_str(
        &object["content"],
        build_type_error("string", "content", &object["content"]),
    )?;
    let records = deserialize_u64(
        &object["records"],
        build_type_error("u64", "records", &object["records"]),
    )?;
    let curpage = deserialize_u64(
        &object["curpage"],
        build_type_error("u64", "curpage", &object["curpage"]),
    )?;
    let pages = deserialize_u64(
        &object["pages"],
        build_type_error("u64", "pages", &object["pages"]),
    )?;
    let values = parse_values(&content)?;
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
        let maybe_model = extract_fund_value(&raw_response);
        match maybe_model {
            Ok(model) => assert_eq!(model, expected_fund_value_model),
            Err(e) => panic!(e),
        }
    }
    #[test]
    fn test_deserialize_fund_value_with_json_error() {
        let raw_response = String::from(
            r#"var apidata={ content:json content,records:2102,pages:211,curpage:1};"#,
        );
        let maybe_model = extract_fund_value(&raw_response);
        match maybe_model {
            Ok(_) => panic!("it should fail"),
            Err(Error::JsonFormatError(_)) => (),
            _ => panic!("it should be failed with JsonFormatError"),
        }
    }
    #[test]
    fn test_deserialize_fund_value_with_type_error() {
        let raw_response = String::from(
            r#"var apidata={ content: "json content",records:"2102",pages:211,curpage:1};"#,
        );
        let maybe_model = extract_fund_value(&raw_response);
        match maybe_model {
            Ok(_) => panic!("it should fail"),
            Err(Error::TypeMismatchError(_)) => (),
            _ => panic!("it should be failed with TypeMismatchError"),
        }
    }
    #[test]
    fn test_deserialize_fund_value_with_wrong_response() {
        let raw_response = String::from("var _apidata={};");
        let maybe_model = extract_fund_value(&raw_response);
        match maybe_model {
            Ok(_) => panic!("it should fail"),
            Err(Error::JsonFormatError(_)) => (),
            _ => panic!("it should be failed with JsonFormatError"),
        }
    }
}
