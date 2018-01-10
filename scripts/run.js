//commonjs here
const path = require('path');
require('babel-register')();
require(path.resolve(process.argv[2]));