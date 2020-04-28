#[derive(Debug, PartialEq)]
pub struct FundValueData {
    // Timestamp in seconds
    pub date: i64,
    pub real_value: f32,
}

#[derive(Debug, PartialEq)]
pub struct FundValueModel {
    pub records: usize,
    pub curpage: usize,
    pub pages: usize,
    pub values: Vec<FundValueData>,
}
