import loaderUtils from 'loader-utils';
import SvgSprite from './svg-sprite';

/**
 * @typedef {Object} SVGSpriteExtractPluginOptions
 * @property {string} [svgCacheNamespace]
 * @property {string} [svgCacheFuncName]
 * @property {string} [idTemplate]
 * @property {string} [context]
 */

/**
 * @type {SVGSpriteExtractPluginOptions}
 */
const DEFAULT_OPTIONS = {
	svgCacheNamespace: 'cacheSvg',
	idTemplate: '[name]'
};

/**
 * @type {string}
 */
const SVG_CACHE_FUNC_PREFIX = 'cacheSvg_';

/**
 * @type {number}
 */
let pluginId = 0;

class SVGSpriteExtractPlugin {

	/**
	 * @type {number}
	 * @private
	 */
	_id;

	/**
	 * @type {string}
	 * @private
	 */
	_filename;

	/**
	 * @type {SVGSpriteExtractPluginOptions}
	 * @private
	 */
	_options;

	/**
	 * @param {string} filename
	 * @param {SVGSpriteExtractPluginOptions} [options]
	 */
	constructor(filename, options) {
		if (!filename) {
			throw new Error('You should provide a filename for SVG sprite');
		}

		this._id = pluginId++;
		this._filename = filename;

		this._options = Object.assign({}, DEFAULT_OPTIONS, options);
		this._options.svgCacheFuncName = SVG_CACHE_FUNC_PREFIX + this._id;
	}

	/**
	 * Resolve loader string for this plugin instance.
	 * @param {string|Array<string>} [loader=[]]
	 * @returns {string} loader string
	 */
	extract(loader = []) {
		let beforeLoaders = loader;

		if (typeof beforeLoaders === 'string') {
			beforeLoaders = beforeLoaders.split('!');
		}

		return [
			`${require.resolve('./loader')}?${JSON.stringify(this._options)}`
		].concat(beforeLoaders).join('!');
	}

	/**
	 * Entry point to this plugin for webpack.
	 * @param {Object} compiler
	 */
	apply(compiler) {
		const {svgCacheNamespace, svgCacheFuncName} = this._options;

		const sprite = new SvgSprite();
		const cacheFunc = svgContent => sprite.append(svgContent);

		compiler.plugin('compilation', compilation => {
			compilation.plugin('normal-module-loader', (loaderContext, module) => {
				loaderContext[svgCacheNamespace] = loaderContext[svgCacheNamespace] || [];
				loaderContext[svgCacheNamespace][svgCacheFuncName] = cacheFunc;
			});
		});

		compiler.plugin('emit', (compilation, callback) => {
			const compiledSprite = sprite.render();
			const filename = loaderUtils.interpolateName({}, this._filename, {
				content: compiledSprite.source()
			});

			compilation.assets[filename] = compiledSprite;
			callback();
		});
	}
}

export default SVGSpriteExtractPlugin;