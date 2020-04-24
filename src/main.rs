extern crate clap;

use clap::{App, SubCommand, Arg};

fn main() {
    let matches = App::new("fund-helper")
        .version("0.1.0")
        .author("Eric W. <wjun0912@gmail.com>")
        .about("help you with fund")
        .subcommand(
            SubCommand::with_name("fetch")
                .about("fetch fund data")
                .arg(
                    Arg::with_name("fund-id")
                    .help("id of the fund")
                    .index(1)
                    .required(true)
                )
        )
        .get_matches();

    if let Some(ref matches) = matches.subcommand_matches("fetch") {
        // Safe to use unwrap() because of the required() option
        println!("fetching fund: {}", matches.value_of("fund-id").unwrap());
    }
}