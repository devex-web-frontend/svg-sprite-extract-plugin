require('babel-register');
var webpack = require('webpack');
var config = require('./webpack.config').default;

new webpack(config, function() {
});