use crate::models::fund_value::FundValueData;
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
    pub fn fetch(&self, id: &str, _: usize) -> Vec<FundValueData> {
        let pages = self.east_money_service.fetch_value(id, 1).pages;
        let values = (1..=pages).fold(vec![], |mut acc, page| {
            acc.extend(self.east_money_service.fetch_value(id, page).values);
            acc
        });
        values
    }
}
