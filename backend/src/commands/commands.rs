use super::{db, fetch, reg_test, server};

pub(crate) async fn main(matches: clap::ArgMatches<'_>) {
    if let Some(ref matches) = matches.subcommand_matches("fetch") {
        fetch::main(matches).await;
    }

    if let Some(ref matches) = matches.subcommand_matches("db") {
        db::main(matches).await;
    }

    if let Some(ref matches) = matches.subcommand_matches("reg-test") {
        reg_test::main(matches).await;
    }

    if let Some(_) = matches.subcommand_matches("server") {
        server::main().await;
    }
}
