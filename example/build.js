require('babel-register');
var Webpack = require('webpack');
var config = require('./webpack.config').default;

new Webpack(config, function() {
});