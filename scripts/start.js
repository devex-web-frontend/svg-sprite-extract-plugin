import minimist from 'minimist';
import path from 'path';
import webpack from 'webpack';
import WDS from 'webpack-dev-server';
import {STATS} from './env';
const argv = minimist(process.argv.slice(2));
const port = argv['port'] || 8080;
const host = argv['host'] || 'localhost';
const configFile = argv['config'] || 'webpack.config.js';
const config = require(path.resolve(configFile)).default;
const compiler = webpack(config);
const server = new WDS(compiler, {
	hot: true,
	historyApiFallback: true,
	stats: STATS,
});

server.listen(port, host, (error, result) => {
	if (error) {
		return console.error(error);
	}

	console.log(`Listening at http://${host}:${port}/`);
	console.log('Compiling...');
});
