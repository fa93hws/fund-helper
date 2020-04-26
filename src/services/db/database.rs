use serde::Deserialize;
use tokio_postgres::{Error, NoTls};

use crate::utils::context::DBInitializationContext;
use crate::utils::deserializer::parse_usize_from_str;
use crate::utils::local_io::read_file;

const INIT_SQL_PATH: &str = "sqls/init.sql";

#[derive(Debug, Deserialize)]
struct DockerDBEnvironment {
    #[serde(rename = "POSTGRES_USER")]
    user: String,
    #[serde(rename = "POSTGRES_PASSWORD")]
    password: String,
    #[serde(rename = "POSTGRES_DB")]
    db_name: String,
}
#[derive(Debug, Deserialize)]
struct DockerDBInfo {
    ports: Vec<String>,
    environment: DockerDBEnvironment,
}
#[derive(Debug, Deserialize)]
struct DockerServices {
    #[serde(rename = "db-prod")]
    prod: DockerDBInfo,
    #[serde(rename = "db-test")]
    test: DockerDBInfo,
}
#[derive(Debug, Deserialize)]
struct DockerYML {
    services: DockerServices,
}

pub enum Environment {
    Prod,
    Test,
}
pub struct DatabaseService {
    user: String,
    password: String,
    db_name: String,
    port: usize,
}
impl DatabaseService {
    pub fn new(env: Environment) -> Self {
        let content = read_file("docker-compose.yml").expect("failed to read docker compose file");
        let yaml_object: DockerYML =
            serde_yaml::from_str(&content).expect("failed to parse yml file");
        let db_env = match env {
            Environment::Prod => yaml_object.services.prod,
            Environment::Test => yaml_object.services.test,
        };
        let port_raw = db_env.ports.get(0).expect("ports[0] should not be empty");
        let port_binding: Vec<&str> = (&port_raw[..]).split(':').collect();
        let port_string = *port_binding.get(0).expect("wrong port binding");
        let context = DBInitializationContext {};
        let port_number = parse_usize_from_str(port_string)
            .expect(&format!("@port_number, Context: {}", context));

        DatabaseService {
            user: db_env.environment.user,
            password: db_env.environment.password,
            db_name: db_env.environment.db_name,
            port: port_number,
        }
    }
    pub async fn init_db(&self) -> Result<(), Error> {
        let option = format!(
            "host=0.0.0.0 user={} password={} dbname={} port={}",
            self.user, self.password, self.db_name, self.port
        );
        let (client, connection) = tokio_postgres::connect(&option[..], NoTls).await?;

        // The connection object performs the actual communication with the database,
        // so spawn it off to run on its own.
        tokio::spawn(async move {
            if let Err(e) = connection.await {
                eprintln!("connection error: {}", e);
            }
        });

        let sql_str = read_file(INIT_SQL_PATH).expect("Failed to read INIT_SQL_PATH");
        client.batch_execute(&sql_str[..]).await?;
        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use crate::utils::local_io::read_file;
    use serde_yaml;

    #[test]
    fn test_get_values_from_yml() {
        let content = read_file("docker-compose.yml").expect("docker compose file");
        let yaml_object: DockerYML = serde_yaml::from_str(&content).expect("wrong yml format");
        assert!(yaml_object.services.prod.environment.db_name.len() > 0);
    }
}
