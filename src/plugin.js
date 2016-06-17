import SvgSprite from './svg-sprite';

/**
 * @typedef {Object} SVGSpriteExtractPluginOptions
 * @property {string} [svgCacheNamespace]
 * @property {string} [svgCacheFuncPrefix]
 * @property {string} [svgCacheFuncName]
 */

/**
 * @type {SVGSpriteExtractPluginOptions}
 */
const DEFAULT_OPTIONS = {
	svgCacheNamespace: 'cacheSvg',
	svgCacheFuncPrefix: 'cacheSvg_'
};

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
		this._options.svgCacheFuncName = this._options.svgCacheFuncPrefix + this._id;
	}

	/**
	 * Resolve loader string for this plugin instance.
	 * @param {string|Array<string>} [loader=[]]
	 * @returns {string} loader string
	 */
	extract(loader = []) {
		let {svgCacheNamespace, svgCacheFuncName} = this._options;

		if (typeof loader === 'string') {
			loader = loader.split('!');
		}

		return [
			require.resolve('./loader') + '?' + JSON.stringify({svgCacheNamespace, svgCacheFuncName})
		].concat(loader).join('!');
	}

	/**
	 * Entry point to this plugin for webpack.
	 * @param {Object} compiler
	 */
	apply(compiler) {
		let {svgCacheNamespace, svgCacheFuncName} = this._options;

		let sprite = new SvgSprite();
		let cacheFunc = svgContent => sprite.append(svgContent);

		compiler.plugin('compilation', compilation => {
			compilation.plugin('normal-module-loader', (loaderContext, module) => {
				loaderContext[svgCacheNamespace] = loaderContext[svgCacheNamespace] || [];
				loaderContext[svgCacheNamespace][svgCacheFuncName] = cacheFunc;
			});
		});

		compiler.plugin('emit', (compilation, callback) => {
			compilation.assets[this._filename] = sprite.render();
			callback();
		});
	}
}

export default SVGSpriteExtractPlugin;