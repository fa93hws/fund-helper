use chrono::NaiveDateTime;
use std::f32;
use tokio_postgres::types::ToSql;
use tokio_postgres::Error;

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

pub enum Order {
    Asc,
    Desc,
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

    pub async fn find_values_with_id(
        &self,
        id: &str,
        order: Order,
    ) -> Result<Vec<FundValueData>, Error> {
        let order_method = match order {
            Order::Asc => "ASC",
            Order::Desc => "DESC",
        };
        let sql = format!(
            "SELECT value, time FROM {} WHERE id = $1 order by time {}",
            TABLE_NAME, order_method
        );
        match self.data_base_service.query(&sql, &[&id]).await {
            Ok(rows) => {
                let values: Vec<FundValueData> = rows
                    .into_iter()
                    .map(|row| FundValueData {
                        date: row.get("time"),
                        real_value: row.get("value"),
                    })
                    .collect();
                Ok(values)
            }
            Err(e) => Err(e),
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use async_trait::async_trait;
    use chrono::NaiveDate;
    use tokio_postgres::{Error, Row};

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
            async fn query_one(
                &self,
                _sql: &str,
                _param: &[&(dyn ToSql + Sync)],
            ) -> Result<Row, Error> {
                panic!("It should not be called")
            }
            async fn query(
                &self,
                _sql: &str,
                _param: &[&(dyn ToSql + Sync)],
            ) -> Result<Vec<Row>, Error> {
                panic!("It should not be called")
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

    #[tokio::main]
    #[test]
    #[should_panic(expected = "This panic is expected to avoid return a result")]
    async fn test_find_value_with_id_sql_text_asc() {
        struct FakeDBService {}
        #[async_trait]
        impl CanExecuteSQL for FakeDBService {
            async fn execute(
                &self,
                _sql: &str,
                _params: &[&(dyn ToSql + Sync)],
            ) -> Result<u64, Error> {
                panic!("It should not be called")
            }
            async fn query_one(
                &self,
                _sql: &str,
                _param: &[&(dyn ToSql + Sync)],
            ) -> Result<Row, Error> {
                panic!("It should not be called")
            }
            async fn query(
                &self,
                sql: &str,
                param: &[&(dyn ToSql + Sync)],
            ) -> Result<Vec<Row>, Error> {
                assert_eq!(
                    sql,
                    "SELECT value, time FROM fund_net_values WHERE id = $1 order by time ASC"
                );
                assert_eq!(format!("{:?}", param[0]), "\"123456\"",);
                panic!("This panic is expected to avoid return a result")
            }
        }

        let data_base_service = FakeDBService {};
        let fund_value_dao = FundValueDAO {
            data_base_service: &data_base_service,
        };
        let _ = fund_value_dao
            .find_values_with_id("123456", Order::Asc)
            .await;
    }

    #[tokio::main]
    #[test]
    #[should_panic(expected = "This panic is expected to avoid return a result")]
    async fn test_find_value_with_id_sql_text_desc() {
        struct FakeDBService {}
        #[async_trait]
        impl CanExecuteSQL for FakeDBService {
            async fn execute(
                &self,
                _sql: &str,
                _params: &[&(dyn ToSql + Sync)],
            ) -> Result<u64, Error> {
                panic!("It should not be called")
            }
            async fn query_one(
                &self,
                _sql: &str,
                _param: &[&(dyn ToSql + Sync)],
            ) -> Result<Row, Error> {
                panic!("It should not be called")
            }
            async fn query(
                &self,
                sql: &str,
                param: &[&(dyn ToSql + Sync)],
            ) -> Result<Vec<Row>, Error> {
                assert_eq!(
                    sql,
                    "SELECT value, time FROM fund_net_values WHERE id = $1 order by time DESC"
                );
                assert_eq!(format!("{:?}", param[0]), "\"123456\"",);
                panic!("This panic is expected to avoid return a result")
            }
        }

        let data_base_service = FakeDBService {};
        let fund_value_dao = FundValueDAO {
            data_base_service: &data_base_service,
        };
        let _ = fund_value_dao
            .find_values_with_id("123456", Order::Desc)
            .await;
    }
}
