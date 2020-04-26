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
