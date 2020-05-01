use tokio::signal;
use actix_web::{web, App, HttpServer, Responder, get};

#[get("/api_v1/{id}")]
async fn index(info: web::Path<u32>) -> impl Responder {
    format!("Hello! id:{}", info)
}

pub async fn main() {
    let local = tokio::task::LocalSet::new();
    local.run_until(async move {
        tokio::task::spawn_local(async move {
            let local = tokio::task::LocalSet::new();
            let sys = actix_rt::System::run_in_tokio("server", &local);
            HttpServer::new(|| {
                App::new().service(index)
            }).bind("127.0.0.1:8080").unwrap().run();
            signal::ctrl_c().await.expect("failed to listen for event");
            println!("received ctrl-c event");
        }).await.unwrap();
    }).await;
}
