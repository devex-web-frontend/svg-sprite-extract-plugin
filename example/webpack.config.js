import path from 'path';
import SVGSpriteExtractPlugin from '../index';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const plugin = new SVGSpriteExtractPlugin('svg.bundle.js', {
	idTemplate: '[path][name]',
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
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			},
			{
				test: /\.svg$/,
				loader: plugin.extract()
			}
		]
	},

	plugins: [
		plugin,
		new HtmlWebpackPlugin({
			template: './index.html'
		})
	]
};