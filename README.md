![GithubCI](https://github.com/fa93hws/fund-helper/workflows/Backend/badge.svg)
![GithubCI](https://github.com/fa93hws/fund-helper/workflows/Frontend/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Fund Helper

Your fund helper :)

It is designed to run regression test for trading strategy on fund in China mainland.

## How to run

### Start backend service

1. cd to `backend` folder
1. Start docker by running `docker-compose up -d`
1. install `node_modules` by running `npm ci`
1. Confirm all unit tests passed by running `npm run test`
1. Start backend by running `npm run start`

### Start frontend page

1. cd to `frontend` folder
1. install `node_modules` by running `npm ci`
1. Confirm all unit tests passed by running `npm run test`
1. Start webpack-dev-server by running `npm run dev`
1. Open `localhost:8081`
