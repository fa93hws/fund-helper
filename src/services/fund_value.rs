use crate::models::fund_value::FundValueModel;
use crate::services::east_money::EastMoneyService;

pub struct FundValueService<'a> {
    east_money_service: &'a EastMoneyService<'a>,
}

impl<'a> FundValueService<'a> {
    pub fn new(east_money_service: &'a EastMoneyService) -> Self {
        return FundValueService { east_money_service };
    }
}

impl<'a> FundValueService<'a> {
    pub async fn fetch(&self, id: &str, _: usize) -> FundValueModel {
        self.east_money_service.fetch_value(id).await
    }
}
