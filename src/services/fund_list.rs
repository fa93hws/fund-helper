use crate::models::fund_list::{FundList, FundListDAO};
use crate::services::east_money::EastMoneyService;

pub struct FundListService<'a> {
    east_money_service: &'a EastMoneyService<'a>,
    fund_list_dao: &'a FundListDAO<'a>,
}

impl<'a> FundListService<'a> {
    pub fn new(east_money_service: &'a EastMoneyService, fund_list_dao: &'a FundListDAO) -> Self {
        return FundListService {
            east_money_service,
            fund_list_dao,
        };
    }
}

impl<'a> FundListService<'a> {
    pub fn fetch(&self) -> FundList {
        self.east_money_service.fetch_list()
    }

    pub fn write_to_db(&self, fund_list: &FundList) {
        self.fund_list_dao.insert_into_db(&fund_list);
    }
}
