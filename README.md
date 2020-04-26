![GithubCI](https://github.com/fa93hws/fund-helper/workflows/build/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# fund-helper

使用方法:

```
[bin] "${command}" "${args}"
```

# Install & Start

1. 确保有 Docker(我的是 19.03.8)
1. (可跳过)修改`docker-compose.yml`中的`POSTGRES_PASSWORD`为任意密码,`POSTGRES_USER`为任意用户名。因为并没有什么敏感数据，改不改密码其实无所谓。。
1. `docker-compose up -d` 初始化镜像
1. `cargo test` 无报错

# Command List

## 数据下载

command: `fetch`

### 参数列表
#### 基金ID(optional)
example: `[bin] fetch <...fund_id>`

如果提供，将会依次下载所有基金数据

如果不提供，将会下载基金列表

<!-- ## 数据查询 (均值/最高/最低)

command: `statistics`

example: `node cli.js statistics --fund-id 000962 --num-days 10`
输出:

```
基金ID: 000962
基金名称: 天弘中证500指数A
10日均值: 0.9439
10日最高: 1.0113
10日最低: 0.8498
```

### 参数列表:

#### fundId(required)

基金代码
类型: `string`

#### numDays(required)

统计天数
类型: `number` -->

# SSH into database:
```
docker exec -it fund-helper-db-test psql -d fund_helper -U fund-helper
```
