'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

var _svgSprite = require('./svg-sprite');

var _svgSprite2 = _interopRequireDefault(_svgSprite);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var DEFAULT_OPTIONS = {
	svgCacheNamespace: 'cacheSvg',
	idTemplate: '[name]'
};

/**
 * @type {string}
 */
var SVG_CACHE_FUNC_PREFIX = 'cacheSvg_';

/**
 * @type {number}
 */
var pluginId = 0;

var SVGSpriteExtractPlugin = function () {

	/**
  * @param {string} filename
  * @param {SVGSpriteExtractPluginOptions} [options]
  */


	/**
  * @type {string}
  * @private
  */

	function SVGSpriteExtractPlugin(filename, options) {
		_classCallCheck(this, SVGSpriteExtractPlugin);

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


	/**
  * @type {SVGSpriteExtractPluginOptions}
  * @private
  */


	/**
  * @type {number}
  * @private
  */


	_createClass(SVGSpriteExtractPlugin, [{
		key: 'extract',
		value: function extract() {
			var loader = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

			var beforeLoaders = loader;

			if (typeof beforeLoaders === 'string') {
				beforeLoaders = beforeLoaders.split('!');
			}

			return [require.resolve('./loader') + '?' + JSON.stringify(this._options)].concat(beforeLoaders).join('!');
		}

		/**
   * Entry point to this plugin for webpack.
   * @param {Object} compiler
   */

	}, {
		key: 'apply',
		value: function apply(compiler) {
			var _this = this;

			var _options = this._options;
			var svgCacheNamespace = _options.svgCacheNamespace;
			var svgCacheFuncName = _options.svgCacheFuncName;


			var sprite = new _svgSprite2.default();
			var cacheFunc = function cacheFunc(svgContent) {
				return sprite.append(svgContent);
			};

			compiler.plugin('compilation', function (compilation) {
				compilation.plugin('normal-module-loader', function (loaderContext, module) {
					loaderContext[svgCacheNamespace] = loaderContext[svgCacheNamespace] || [];
					loaderContext[svgCacheNamespace][svgCacheFuncName] = cacheFunc;
				});
			});

			compiler.plugin('emit', function (compilation, callback) {
				var compiledSprite = sprite.render();
				var filename = _loaderUtils2.default.interpolateName({}, _this._filename, {
					content: compiledSprite.source()
				});

				compilation.assets[filename] = compiledSprite;
				callback();
			});
		}
	}]);

	return SVGSpriteExtractPlugin;
}();

exports.default = SVGSpriteExtractPlugin;