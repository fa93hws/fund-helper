const path = require('path');

require('ts-node').register({
  project: path.join(__dirname, '..', 'tsconfig.tsnode.json'),
  transpileOnly: true,
});
