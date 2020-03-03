![GithubCI](https://github.com/fa93hws/fund-helper/workflows/CI/badge.svg)
![Codecov](https://codecov.io/gh/fa93hws/fund-helper/branch/master/graph/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypescriptStrict](https://camo.githubusercontent.com/41c68e9f29c6caccc084e5a147e0abd5f392d9bc/68747470733a2f2f62616467656e2e6e65742f62616467652f547970655363726970742f7374726963742532302546302539462539322541412f626c7565)

# fund-helper

使用方法:

```
node cli.js "${command}" "${args}"
```

# Install & Start

1. 确保有 Docker(我的是 19.03.5)
1. (可跳过)修改`docker-compose.yml`中的`POSTGRES_PASSWORD`为任意密码,`POSTGRES_USER`为任意用户名。因为并没有什么敏感数据，改不改密码其实无所谓。。
1. `docker-compose up -d` 初始化镜像
1. `npm run test` 无报错
1. `node cli.js database init` 初始化数据库

# Command List

## 数据查询 (均值/最高/最低)

command: `statistics [fundIds...]`

example: `node cli.js statistics 320007 005223 --numDays 20`
输出:

```
基金ID: 005223
基金名称: 广发中证基建工程指数A
基金类型: 股票指数
20日均值: 0.7186
20日最高: 0.7864
20日最低: 0.6716

基金ID: 320007
基金名称: 诺安成长混合
基金类型: 混合型
20日均值: 1.5793
20日最高: 1.812
20日最低: 1.393

```

### 参数列表:

#### fundIds(required)

基金代码
类型: `string[]`

#### numDays(required)

统计天数
类型: `number`
