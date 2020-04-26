use tokio_postgres::{Error, NoTls};

use crate::utils::local_io::read_file;

const INIT_SQL_PATH: &str = "sqls/init.sql";

pub struct DatabaseService {
    user: String,
    password: String,
    db_name: String,
    port: usize,
}

impl DatabaseService {
    pub fn new(user: &str, password: &str, db_name: &str, port: usize) -> Self {
        DatabaseService {
            user: String::from(user),
            password: String::from(password),
            db_name: String::from(db_name),
            port,
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

        let sql_str = match read_file(INIT_SQL_PATH) {
            Ok(content) => content,
            Err(_) => panic!("Failed to read file@{}", INIT_SQL_PATH),
        };
        client.batch_execute(&sql_str[..]).await?;
        Ok(())
    }
}
