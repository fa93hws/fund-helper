![GithubCI](https://github.com/fa93hws/fund-helper/workflows/CI/badge.svg)
![Codecov](https://codecov.io/gh/fa93hws/fund-helper/branch/master/graph/badge.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypescriptStrict](https://camo.githubusercontent.com/41c68e9f29c6caccc084e5a147e0abd5f392d9bc/68747470733a2f2f62616467656e2e6e65742f62616467652f547970655363726970742f7374726963742532302546302539462539322541412f626c7565)

# fund-helper

使用方法:

```
node cli.js "${command}" "${args}"
```

# Command List

## 数据查询 (均值/最高/最低)

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
类型: `number`
