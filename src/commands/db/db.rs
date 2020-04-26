use crate::commands::Services;
use futures::executor::block_on;

fn init_db(services: &Services) {
    match block_on(services.database_service.init_db()) {
        Ok(_) => println!("database initialized"),
        Err(e) => panic!("{:?}", e),
    }
}

pub(in crate::commands) fn main(matches: &clap::ArgMatches<'_>, services: &Services) {
    if let Some(_) = matches.subcommand_matches("init") {
        init_db(&services);
    }
}
