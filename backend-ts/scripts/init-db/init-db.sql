DROP TABLE IF EXISTS cn_fund_values;
DROP TABLE IF EXISTS cn_fund_infos;

CREATE TABLE cn_fund_infos (
  id varchar(10) PRIMARY KEY,
  name varchar(64) NOT NULL,
  type varchar(64) NOT NULL
);
CREATE INDEX cn_fund_info_name_idx on cn_fund_infos(name);
CREATE INDEX cn_fund_info_type_idx on cn_fund_infos(type);

CREATE TABLE cn_fund_values (
  id varchar(10) REFERENCES cn_fund_infos(id),
  time TIMESTAMP NOT NULL,
  value float(4) NOT NULL,
  PRIMARY KEY (id, time)
);
CREATE INDEX cn_fund_net_values_value_idx on cn_fund_values(value);
