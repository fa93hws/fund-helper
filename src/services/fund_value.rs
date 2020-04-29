use futures::future::join_all;

use crate::models::fund_value::FundValueDAO;
use crate::services::east_money::EastMoneyService;

pub struct FundValueService<'a> {
    east_money_service: &'a EastMoneyService<'a>,
    fund_value_dao: &'a FundValueDAO<'a>,
}

impl<'a> FundValueService<'a> {
    pub fn new(east_money_service: &'a EastMoneyService, fund_value_dao: &'a FundValueDAO) -> Self {
        return FundValueService {
            east_money_service,
            fund_value_dao,
        };
    }
}

impl<'a> FundValueService<'a> {
    pub async fn fetch_and_update_db(&self, id: &str) {
        let pages = self.east_money_service.fetch_value(id, 1).await.pages;
        let mut promises = vec![];
        (1..=pages).for_each(|page| {
            promises.push(self.east_money_service.fetch_value(id, page));
        });
        let responses = join_all(promises).await;
        let values = responses.into_iter().fold(vec![], |mut acc, response| {
            acc.extend(response.values);
            acc
        });
        self.fund_value_dao.insert_into_db(id, &values).await;
    }
}
