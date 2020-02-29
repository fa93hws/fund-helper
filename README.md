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
