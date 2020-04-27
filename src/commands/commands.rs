use super::{db, fetch};

pub(crate) async fn main(matches: clap::ArgMatches<'_>) {
    if let Some(ref matches) = matches.subcommand_matches("fetch") {
        fetch::main(matches).await;
    }

    if let Some(ref matches) = matches.subcommand_matches("db") {
        db::main(matches).await;
    }
}
