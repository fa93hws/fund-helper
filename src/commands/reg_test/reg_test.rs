use super::test_with_avg;

pub async fn main(matches: &clap::ArgMatches<'_>) {
    if let Some(id) = matches.value_of("fund-id") {
        test_with_avg(id).await;
    }
}
