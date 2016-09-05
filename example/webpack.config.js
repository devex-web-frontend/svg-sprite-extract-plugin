import path from 'path';
import SVGSpriteExtractPlugin from '../index';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import WebpackBrowserPlugin from 'webpack-browser-plugin';

const plugin = new SVGSpriteExtractPlugin('svg.bundle.[hash].js', {
	idTemplate: '[path][name].[hash].[ext]',
	context: path.resolve(__dirname),
	preserveColors: /\.colored\./
});

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
		plugin,
		new HtmlWebpackPlugin(),
		new WebpackBrowserPlugin()
	]
};