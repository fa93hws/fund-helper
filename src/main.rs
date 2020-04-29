extern crate clap;
extern crate std;

use clap::{App, Arg, SubCommand};

mod commands;
mod models;
mod services;
mod utils;

#[tokio::main]
async fn main() {
    let matches = App::new("fund-helper")
        .version("0.1.0")
        .author("Eric W. <wjun0912@gmail.com>")
        .about("help you with fund")
        .subcommand(
            SubCommand::with_name("fetch").about("fetch fund data").arg(
                Arg::with_name("fund-id")
                    .help("id of the fund")
                    .multiple(true),
            ),
        )
        .subcommand(
            SubCommand::with_name("db")
                .about("database related execution")
                .subcommand(SubCommand::with_name("init").about("initialize the database")),
        )
        .get_matches();

    commands::main(matches).await;
}
