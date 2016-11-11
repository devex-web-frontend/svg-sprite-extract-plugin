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
 * @property {string} [idTemplate]
 * @property {string} [context]
 * @property {RegExp} [preserveColors]
 * @property {Function} [spriteProcessor]
 */

/**
 * @type {SVGSpriteExtractPluginOptions}
 */
var DEFAULT_OPTIONS = {
	idTemplate: '[name]'
};

/**
 * @type {string}
 */
var PLUGIN_NS_PREFIX = '__SVG_SPRITE_EXTRACT__';

/**
 * @type {number}
 */
var pluginId = 0;

var SVGSpriteExtractPlugin = function () {

	/**
  * @param {string} filenameTemplate
  * @param {SVGSpriteExtractPluginOptions} [options]
  */


	/**
  * @type {Array<Error>}
  * @private
  */


	/**
  * @type {SVGSpriteExtractPluginOptions}
  * @private
  */


	/**
  * @type {number}
  * @private
  */
	function SVGSpriteExtractPlugin(filenameTemplate) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, SVGSpriteExtractPlugin);

		this._errors = [];

		if (!filenameTemplate) {
			throw new Error('SVG-EXTRACT-PLUGIN: You should provide a filename for SVG sprite');
		} else if (options.preserveColors && !options.preserveColors.test) {
			throw new Error('SVG-EXTRACT-PLUGIN: \'preserveColors\' option should be a valid RegExp');
		} else if (options.spriteProcessor && typeof options.spriteProcessor !== 'function') {
			throw new Error('SVG-EXTRACT-PLUGIN: \'spriteProcessor\' option should be a function');
		}

		this._id = pluginId++;
		this._filenameTemplate = filenameTemplate;

		this._options = Object.assign({}, DEFAULT_OPTIONS, options);
		this._exportedFuncName = PLUGIN_NS_PREFIX + this._id;

		this._sprite = new _svgSprite2.default(this._options.preserveColors, this._options.spriteProcessor);
	}

	/**
  * Resolve loader string for this plugin instance.
  * @param {string|Array<string>} [loader=[]]
  * @returns {string} loader string
  */


	/**
  * @type {string}
  * @private
  */


	/**
  * @type {SvgSprite}
  * @private
  */


	/**
  * @type {string}
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

			var query = {
				idTemplate: this._options.idTemplate,
				context: this._options.context,
				storeSvgFuncName: this._exportedFuncName
			};

			return [require.resolve('./loader') + '?' + JSON.stringify(query)].concat(beforeLoaders).join('!');
		}

		/**
   * Entry point to this plugin for webpack.
   * @param {Object} compiler
   */

	}, {
		key: 'apply',
		value: function apply(compiler) {
			var _this = this;

			compiler.plugin('compilation', function (compilation) {
				compilation.plugin('normal-module-loader', function (loaderContext, module) {
					loaderContext[_this._exportedFuncName] = _this.onStore.bind(_this);
				});
			});

			compiler.plugin('emit', function (compilation, callback) {
				if (_this._errors.length > 0) {
					return callback('SVG-EXTRACT-PLUGIN: Unable to build \'' + _this._filenameTemplate + '\':\n' + ('\t' + _this._errors.map(function (e) {
						return e.message;
					}).join('\n\t') + '\n'));
				}

				var compiledSprite = _this._sprite.render();
				var filename = _loaderUtils2.default.interpolateName({}, _this._filenameTemplate, {
					content: compiledSprite.source()
				});

				compilation.assets[filename] = compiledSprite;
				callback();
			});
		}

		/**
   * Handler for SVG images passed from loader context
   * @param {string} id
   * @param {string} content
   * @param {string} spritePath
   */

	}, {
		key: 'onStore',
		value: function onStore(id, content, spritePath) {
			try {
				this._sprite.append(id, content, spritePath);
			} catch (e) {
				this._errors.push(e);
			}
		}
	}]);

	return SVGSpriteExtractPlugin;
}();

exports.default = SVGSpriteExtractPlugin;