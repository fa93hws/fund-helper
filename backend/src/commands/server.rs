use actix_web::{get, http, web, App, HttpResponse, HttpServer, Responder};
use serde::Serialize;
use tokio::signal;

use crate::models::fund_list::{to_type_name, FundListDAO};
use crate::models::fund_value::{FundValueDAO, FundValueData};
use crate::services::database::{DatabaseService, Environment};
use crate::services::east_money::EastMoneyService;
use crate::services::http::HttpService;
use crate::services::{FundListService, FundValueService};

#[derive(Debug, Serialize)]
struct FundValueResponse {
    pub id: String,
    pub name: String,
    pub typ: String,
    pub values: Vec<FundValueData>,
}

#[get("/api_v1/values/{id}")]
async fn get_values(id: web::Path<String>) -> impl Responder {
    // TODO Refactor them into a singleton
    let http_service = HttpService::new();
    let east_money_service = EastMoneyService::new(&http_service);
    let database_service = DatabaseService::new(Environment::Prod);
    let fund_value_dao = FundValueDAO::new(&database_service);
    let fund_value_service = FundValueService::new(&east_money_service, &fund_value_dao);
    let fund_list_dao = FundListDAO::new(&database_service);
    let fund_list_service = FundListService::new(&east_money_service, &fund_list_dao);

    match fund_list_service.find_fund_info(&id).await {
        Ok(info) => {
            let values = fund_value_service.get_values_for_regression(&id).await;
            let out = FundValueResponse {
                id: info.id,
                name: info.name,
                typ: to_type_name(&info.typ).to_string(),
                values,
            };
            HttpResponse::build(http::StatusCode::from_u16(200).unwrap()).json(out)
        }
        Err(_) => HttpResponse::build(http::StatusCode::from_u16(404).unwrap()).body("Not found!"),
    }
}

pub async fn main() {
    let local = tokio::task::LocalSet::new();
    local
        .run_until(async move {
            tokio::task::spawn_local(async move {
                let local = tokio::task::LocalSet::new();
                let sys = actix_rt::System::run_in_tokio("server", &local);
                HttpServer::new(|| App::new().service(get_values))
                    .bind("127.0.0.1:8080")
                    .unwrap()
                    .run();
                signal::ctrl_c().await.expect("failed to listen for event");
                println!("received ctrl-c event");
            })
            .await
            .unwrap();
        })
        .await;
}
