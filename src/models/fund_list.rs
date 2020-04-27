use crate::services::database::DatabaseService;

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
    data_base_service: &'a DatabaseService,
}

impl<'a> FundListDAO<'a> {
    pub fn new(data_base_service: &'a DatabaseService) -> Self {
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
        let sql = format!("{}{}", insert_sql_prefix, value_parts.join(","));
        match self.data_base_service.execute(&sql).await {
            Err(e) => panic!("{:?}", e),
            _ => (),
        }
    }
}
