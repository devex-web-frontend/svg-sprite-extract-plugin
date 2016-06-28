'use strict';

require('babel-register');

const Webpack = require('webpack');
const config = require('./webpack.config').default;

const WEBPACK_STATS = {
	assets: true,
	children: true,
	chunkModules: true,
	chunks: true,
	colors: true,
	errorDetails: true,
	errors: true,
	hash: true,
	modules: true,
	publicPath: true,
	reasons: true,
	source: false,
	timings: false,
	version: true,
	warnings: true
};

const compiler = new Webpack(config, (error, stats) => {
	if (error) {
		printError(error);
	} else {
		const jsonStats = stats.toJson();
		if (jsonStats.errors.length > 0) {
			printError(jsonStats.errors);
		} else {
			console.log(stats.toString(WEBPACK_STATS));
		}
	}
});

/**
 * @param {Array|Object} e
 */
function printError(e) {
	const errors = Array.isArray(e) ? e : [e];
	errors.forEach(error => {
		console.error();
		console.error(error.stack || error);
		console.error();
	});

	process.exit(1);
}