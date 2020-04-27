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

fn to_type_name(typ: &FundType) -> &'static str {
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
    pub async fn insert_into_db(&self, fund_list: &FundList) {
        let insert_sql_prefix = format!("INSERT INTO {} (id, name, type) VALUES ", TABLE_NAME);
        let value_parts: Vec<String> = fund_list
            .into_iter()
            .map(|fund_info_item| {
                let fund_type_name = to_type_name(&fund_info_item.typ);
                format!(
                    "('{}', '{}', '{}')",
                    fund_info_item.id, fund_info_item.name, fund_type_name
                )
            })
            .collect();
        let sql = format!(
            "{}{} ON CONFLICT (id) DO NOTHING;",
            insert_sql_prefix,
            value_parts.join(",")
        );
        match self.data_base_service.execute(&sql).await {
            Err(e) => panic!("{:?}", e),
            _ => (),
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use async_trait::async_trait;
    use futures::executor::block_on;
    use tokio_postgres::Error;

    #[test]
    fn test_insert_into_db_sql_text() {
        struct FakeDBService {}
        #[async_trait]
        impl CanExecuteSQL for FakeDBService {
            async fn execute(&self, sql: &str) -> Result<(), Error> {
                assert_eq!(
                    sql,
                    "INSERT INTO fund_info (id, name, type) VALUES ('000001', 'guming', '指数'),('000011', 'chenwenxin', '股票') ON CONFLICT (id) DO NOTHING;"
                );
                Ok(())
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
        block_on(fund_list_dao.insert_into_db(&fund_list));
    }
}
