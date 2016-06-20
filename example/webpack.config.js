import path from 'path';
import SVGSpriteExtractPlugin from '../src/index';

const plugin = new SVGSpriteExtractPlugin('svg.bundle.js');

export default {
	context: path.resolve(__dirname),

	entry: './main.js',

	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'bundle.js'
	},

	module: {
		loaders: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel'
			},
			{
				test: /\.svg$/,
				loader: plugin.extract()
			}
		]
	},

	plugins: [
		plugin
	]
};