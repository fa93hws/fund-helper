DROP TABLE IF EXISTS fund_info;
DROP TABLE IF EXISTS fund_net_values;

CREATE TABLE fund_info (
  id varchar(10) PRIMARY KEY,
  name varchar(64) NOT NULL,
  type varchar(64) NOT NULL
);

CREATE TABLE fund_net_values(
  id varchar(10) PRIMARY KEY,
  time TIMESTAMP NOT NULL,
  value float(4) NOT NULL
);
