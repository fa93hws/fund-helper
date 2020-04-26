#[derive(Debug, PartialEq)]
pub enum FundType {
    Mix,
    Bond,
    Index,
    QDII,
    Stock,
    NotInterested,
}

#[derive(Debug, PartialEq)]
pub struct FundListItem {
    pub id: String,
    pub name: String,
    pub typ: FundType,
}

pub type FundList = Vec<FundListItem>;
