#[derive(Debug, PartialEq)]
pub struct FundValueData {
    pub date: String,
    pub real_value: f32,
}

#[derive(Debug, PartialEq)]
pub struct FundValueModel {
    pub records: usize,
    pub curpage: usize,
    pub pages: usize,
    pub values: Vec<FundValueData>,
}
