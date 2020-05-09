use crate::services::database::{CanInitDB, DatabaseService, Environment};

async fn init_db() {
    let database_service = DatabaseService::new(Environment::Prod);

    database_service.init_db().await.unwrap();
}

pub(in crate::commands) async fn main(matches: &clap::ArgMatches<'_>) {
    if let Some(_) = matches.subcommand_matches("init") {
        init_db().await;
    }
}
