use chrono::NaiveDateTime;
use tokio_postgres::types::ToSql;

use crate::services::database::CanExecuteSQL;

const TABLE_NAME: &str = "fund_net_values";

#[derive(Debug, PartialEq)]
pub struct FundValueData {
    // Timestamp in seconds
    pub date: NaiveDateTime,
    pub real_value: f32,
}

pub struct FundValueDAO<'a> {
    data_base_service: &'a dyn CanExecuteSQL,
}

impl<'a> FundValueDAO<'a> {
    pub fn new(data_base_service: &'a dyn CanExecuteSQL) -> Self {
        FundValueDAO { data_base_service }
    }
}

impl<'a> FundValueDAO<'a> {
    pub async fn insert_into_db(&self, id: &str, values: &Vec<FundValueData>) {
        let insert_sql_prefix = format!("INSERT INTO {} (id, time, value) VALUES ", TABLE_NAME);
        let mut params: Vec<&(dyn ToSql + Sync)> = vec![];
        let sql_fragments: Vec<String> = values
            .into_iter()
            .map(|fund_value_data| {
                let params_count = params.len();
                let sql_fragment = format!(
                    "(${}, ${}, ${})",
                    params_count + 1,
                    params_count + 2,
                    params_count + 3
                );
                params.push(&id);
                params.push(&fund_value_data.date);
                params.push(&fund_value_data.real_value);
                sql_fragment
            })
            .collect();
        let sql = format!(
            "{}{} ON CONFLICT (id,time) DO UPDATE SET value = EXCLUDED.value;",
            insert_sql_prefix,
            sql_fragments.join(",")
        );
        match self.data_base_service.execute(&sql, &params).await {
            Err(e) => panic!("{:?}", e),
            _ => (),
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use async_trait::async_trait;
    use chrono::NaiveDate;
    use tokio_postgres::Error;

    #[tokio::main]
    #[test]
    async fn test_insert_into_db_sql_text() {
        struct FakeDBService {}
        #[async_trait]
        impl CanExecuteSQL for FakeDBService {
            async fn execute(
                &self,
                sql: &str,
                params: &[&(dyn ToSql + Sync)],
            ) -> Result<u64, Error> {
                assert_eq!(
                    sql,
                    "INSERT INTO fund_net_values (id, time, value) VALUES ($1, $2, $3),($4, $5, $6) ON CONFLICT (id,time) DO UPDATE SET value = EXCLUDED.value;",
                );
                assert_eq!(format!("{:?}", params[0]), "\"123456\"");
                assert_eq!(format!("{:?}", params[1]), "1999-02-04T07:00:00");
                assert_eq!(format!("{:?}", params[2]), "1.23");
                assert_eq!(format!("{:?}", params[3]), "\"123456\"");
                assert_eq!(format!("{:?}", params[4]), "1989-09-12T07:00:00");
                assert_eq!(format!("{:?}", params[5]), "1.24");
                Ok(1)
            }
        }

        let data_base_service = FakeDBService {};
        let fund_value_dao = FundValueDAO {
            data_base_service: &data_base_service,
        };
        let fund_values: Vec<FundValueData> = vec![
            FundValueData {
                date: NaiveDate::from_ymd(1999, 2, 4).and_hms(7, 0, 0),
                real_value: 1.23,
            },
            FundValueData {
                date: NaiveDate::from_ymd(1989, 9, 12).and_hms(7, 0, 0),
                real_value: 1.24,
            },
        ];
        fund_value_dao.insert_into_db("123456", &fund_values).await;
    }
}
