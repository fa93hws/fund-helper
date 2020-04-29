use super::{db, fetch};

pub(crate) fn main(matches: clap::ArgMatches<'_>) {
    if let Some(ref matches) = matches.subcommand_matches("fetch") {
        fetch::main(matches);
    }

    if let Some(ref matches) = matches.subcommand_matches("db") {
        db::main(matches);
    }
}
