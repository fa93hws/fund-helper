use futures::executor::block_on;
type Services<'a> = super::Services<'a>;

fn fetch_one(id: &str, services: &Services) {
  println!("fetching fund: {}", id);
  let result = services.east_money_service.fetch_value(id);
  let body = block_on(result);
  println!("{}", body);
}

fn fetch_all() {
  println!("fetching all!");
}

pub fn main(matches: &clap::ArgMatches<'_>, services: Services) {
  if !matches.is_present("fund-id") {
    fetch_all();
  } else if let Some(ids) = matches.values_of("fund-id") {
    for id in ids {
      fetch_one(id, &services);
    }
  }
}
