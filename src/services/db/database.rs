use tokio_postgres::{Error, NoTls};

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

        // TODO: Inject sql content from init.sql
        client
            .batch_execute(
                r#"DROP TABLE IF EXISTS fund_net_values;
            DROP TABLE IF EXISTS fund_info;
            
            CREATE TABLE fund_info (
              id varchar(10) PRIMARY KEY,
              name varchar(64) NOT NULL,
              type varchar(64) NOT NULL
            );
            CREATE INDEX fund_info_name_idx on fund_info(name);
            CREATE INDEX fund_info_type_idx on fund_info(type);
            
            CREATE TABLE fund_net_values (
              id varchar(10) REFERENCES fund_info(id),
              time TIMESTAMP NOT NULL,
              value float(4) NOT NULL,
              PRIMARY KEY (id, time)
            );
            CREATE INDEX fund_net_values_value_idx on fund_net_values(value);
            "#,
            )
            .await?;
        Ok(())
    }
}
