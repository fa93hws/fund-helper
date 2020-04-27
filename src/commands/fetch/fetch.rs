use crate::commands::Services;
use futures::executor::block_on;

fn fetch_one(id: &str, services: &Services) {
    println!("fetching fund: {}", id);
    let result = services.east_money_service.fetch_value(id);
    let fund_value_model = block_on(result);
    println!("{:?}", fund_value_model);
}

fn fetch_all(services: &Services) {
    println!("fetching all!");
    let list_result = block_on(services.east_money_service.fetch_list());
    block_on(services.fund_list_dao.insert_into_db(&list_result));
    println!("{:?}", list_result);
}

pub(in crate::commands) fn main(matches: &clap::ArgMatches<'_>, services: &Services) {
    if !matches.is_present("fund-id") {
        fetch_all(&services);
    } else if let Some(ids) = matches.values_of("fund-id") {
        for id in ids {
            fetch_one(id, &services);
        }
    }
}
