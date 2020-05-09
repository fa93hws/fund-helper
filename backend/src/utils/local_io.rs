use std::error::Error;
use std::fs;
use std::io::prelude::*;

#[cfg(test)]
#[cfg(windows)]
const LINE_ENDING: &'static str = "\r\n";
#[cfg(test)]
#[cfg(not(windows))]
const LINE_ENDING: &'static str = "\n";

pub fn read_file(path: &str) -> Result<String, Box<dyn Error + 'static>> {
    let mut file = fs::File::open(path)?;
    let mut content = String::default();
    file.read_to_string(&mut content)?;
    Ok(content)
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_read_file_success() {
        let file_result = read_file("src/services/fixtures/a.sql");
        match file_result {
            Ok(content) => assert_eq!(
                content,
                format!(
                    "DROP TABLE IF EXISTS fund_net_values;{}DROP TABLE IF EXISTS fund_info;{}",
                    LINE_ENDING, LINE_ENDING
                ),
            ),
            Err(_) => panic!("It should read the file"),
        }
    }
}
