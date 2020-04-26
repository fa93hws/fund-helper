DROP TABLE IF EXISTS fund_net_values;
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
