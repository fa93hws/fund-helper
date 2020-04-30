use tokio_postgres::types::ToSql;
use tokio_postgres::Error;

use crate::services::database::CanExecuteSQL;

const TABLE_NAME: &str = "fund_info";
const MIX_TYPE_NAME: &str = "混合";
const BOND_TYPE_NAME: &str = "债券";
const INDEX_TYPE_NAME: &str = "指数";
const QDII_TYPE_NAME: &str = "QDII";
const STOCK_TYPE_NAME: &str = "股票";
const NOT_INTERESTED_TYPE_NAME: &str = "其他";

#[derive(Debug, PartialEq)]
pub enum FundType {
    Mix,
    Bond,
    Index,
    QDII,
    Stock,
    NotInterested,
}

fn to_type_name(typ: &FundType) -> &str {
    match typ {
        FundType::Mix => MIX_TYPE_NAME,
        FundType::Bond => BOND_TYPE_NAME,
        FundType::Index => INDEX_TYPE_NAME,
        FundType::QDII => QDII_TYPE_NAME,
        FundType::Stock => STOCK_TYPE_NAME,
        FundType::NotInterested => NOT_INTERESTED_TYPE_NAME,
    }
}

fn to_type_enum(typ: &str) -> FundType {
    match typ {
        MIX_TYPE_NAME => FundType::Mix,
        BOND_TYPE_NAME => FundType::Bond,
        INDEX_TYPE_NAME => FundType::Index,
        QDII_TYPE_NAME => FundType::QDII,
        STOCK_TYPE_NAME => FundType::Stock,
        NOT_INTERESTED_TYPE_NAME => FundType::NotInterested,
        _ => unreachable!(typ),
    }
}

#[derive(Debug, PartialEq)]
pub struct FundListItem {
    pub id: String,
    pub name: String,
    pub typ: FundType,
}

pub type FundList = Vec<FundListItem>;

pub struct FundListDAO<'a> {
    data_base_service: &'a dyn CanExecuteSQL,
}

impl<'a> FundListDAO<'a> {
    pub fn new(data_base_service: &'a dyn CanExecuteSQL) -> Self {
        FundListDAO { data_base_service }
    }
}

impl<'a> FundListDAO<'a> {
    pub async fn insert_into_db(&self, fund_list: &'a FundList) -> Result<u64, Error> {
        let insert_sql_prefix = format!("INSERT INTO {} (id, name, type) VALUES ", TABLE_NAME);
        let type_names: Vec<&str> = fund_list
            .into_iter()
            .map(|item| to_type_name(&item.typ))
            .collect();
        let mut params: Vec<&(dyn ToSql + Sync)> = vec![];
        let sql_fragments: Vec<String> = fund_list
            .into_iter()
            .enumerate()
            .map(|(idx, item)| {
                let param_count = params.len();
                let sql_fragment = format!(
                    "(${}, ${}, ${})",
                    param_count + 1,
                    param_count + 2,
                    param_count + 3,
                );
                params.push(&item.id);
                params.push(&item.name);
                params.push(&type_names[idx]);
                sql_fragment
            })
            .collect();
        let sql = format!(
            "{}{} ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type= EXCLUDED.type;",
            insert_sql_prefix,
            sql_fragments.join(",")
        );

        self.data_base_service.execute(&sql, &params).await
    }

    pub async fn query_fund_with_id(&self, id: &str) -> Result<FundListItem, Error> {
        let row_result = self
            .data_base_service
            .query_one(
                &format!("SELECT name, type from {} WHERE id = $1", TABLE_NAME),
                &[&id],
            )
            .await;
        match row_result {
            Ok(row) => {
                let name: String = row.get("name");
                let typ_str: &str = row.get("type");
                let typ_enum = to_type_enum(typ_str);
                Ok(FundListItem {
                    id: id.to_string(),
                    name,
                    typ: typ_enum,
                })
            }
            Err(e) => Err(e),
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use async_trait::async_trait;
    use tokio_postgres::{Error, Row};

    #[tokio::main]
    #[test]
    async fn test_insert_fund_list_into_db_sql_text() {
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
                    "INSERT INTO fund_info (id, name, type) VALUES ($1, $2, $3),($4, $5, $6) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, type= EXCLUDED.type;"
                );
                let expected_params =
                    vec!["000001", "guming", "指数", "000011", "chenwenxin", "股票"];
                assert_eq!(expected_params.len(), params.len());
                for idx in 0..params.len() {
                    let got = format!("{:?}", params[idx]);
                    let expected = format!("\"{}\"", expected_params[idx]);
                    assert_eq!(got, expected);
                }
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
        let fund_list_dao = FundListDAO {
            data_base_service: &data_base_service,
        };
        let fund_list: FundList = vec![
            FundListItem {
                id: "000001".to_string(),
                name: "guming".to_string(),
                typ: FundType::Index,
            },
            FundListItem {
                id: "000011".to_string(),
                name: "chenwenxin".to_string(),
                typ: FundType::Stock,
            },
        ];
        match fund_list_dao.insert_into_db(&fund_list).await {
            Ok(_) => (),
            Err(_) => panic!("it should not throw"),
        };
    }

    #[tokio::main]
    #[test]
    #[should_panic(expected = "this is expected")]
    async fn test_query_fund_with_id_sql_test() {
        struct FakeDBService {}
        #[async_trait]
        impl CanExecuteSQL for FakeDBService {
            async fn execute(&self, _: &str, __: &[&(dyn ToSql + Sync)]) -> Result<u64, Error> {
                Ok(1)
            }
            async fn query_one(
                &self,
                sql: &str,
                param: &[&(dyn ToSql + Sync)],
            ) -> Result<Row, Error> {
                assert_eq!(sql, "SELECT name, type from fund_info WHERE id = $1");
                assert_eq!(format!("{:?}", param[0]), "\"123456\"");
                panic!("this is expected")
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
        let fund_list_dao = FundListDAO {
            data_base_service: &data_base_service,
        };
        let _ = fund_list_dao.query_fund_with_id("123456").await;
    }
}
