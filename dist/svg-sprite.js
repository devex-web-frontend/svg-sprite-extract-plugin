'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _webpackSources = require('webpack-sources');

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @type {string}
 */
var SCRIPT_HEADER = '(function() {';

/**
 * @type {string}
 */
var SPRITE_CONTENT_TEMPLATE = '\n\tvar sprite = "<svg xmlns=\\"http://www.w3.org/2000/svg\\">%s</svg>";\n\t';

/**
 * @type {string}
 */
var SCRIPT_FOOTER = '\n\tvar svgSprite = document.createElement(\'div\');\n\tsvgSprite.id = \'svg_assets\';\n\tsvgSprite.height = 0;\n\tsvgSprite.width = 0;\n\tsvgSprite.setAttribute(\'style\', \'position: absolute; right: 100%; visibility: hidden;\');\n\tsvgSprite.innerHTML = sprite;\n\t\n\tif (document.body) {\n\t\tdocument.body.insertBefore(svgSprite, document.body.firstChild);\n\t} else {\n\t\tdocument.addEventListener(\'DOMContentLoaded\', function() {\n\t\t\tdocument.body.insertBefore(svgSprite, document.body.firstChild)\n\t\t});\n\t}\n})();';

/**
 * @type {string[]}
 */
var ALLOWED_ROOT_TAGS = ['svg', 'symbol'];

/**
 * Representation of the result spritesheet.
 * Stores all images and renders them to output javascript.
 * @class
 */

var SvgSprite = function () {

	/**
  * Regex for sprites which colors shouldn't be removed
  * @type {RegExp}
  * @private
  */
	function SvgSprite() {
		var preserveColors = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
		var customSpriteProcessor = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

		_classCallCheck(this, SvgSprite);

		this._images = {};

		this._preserveColors = preserveColors;
		this._spriteProcessor = typeof customSpriteProcessor === 'function' ? customSpriteProcessor : this._processSpriteContent;
	}

	/**
  * Add a new image to this spritesheet if it is not currently stored.
  * @param {string} id image id
  * @param {string} content image content
  * @param {string} spritePath
  * @throws Will throw an error if the image with such id is currently in this spritesheet.
  */


	/**
  * Function for processing sprite content before it would be stored in the result.
  * @type {Function}
  * @private
  */

	/**
  * Images by id.
  * @type {Object<string, string>}
  * @private
  */


	_createClass(SvgSprite, [{
		key: 'append',
		value: function append(id, content, spritePath) {
			if (this.contains(id)) {
				throw new Error('\'' + spritePath + '\': duplicated id - \'' + id + '\'');
			}

			this._images[id] = this._spriteProcessor(id, content, spritePath);
		}

		/**
   * Check if the image with such id is currently in the sprite.
   * @param {string} id image id
   * @returns {boolean}
   */

	}, {
		key: 'contains',
		value: function contains(id) {
			return id in this._images;
		}

		/**
   * Render spritesheet to javascript.
   * @returns {ConcatSource} an object suitable for compilation.assets collection.
   */

	}, {
		key: 'render',
		value: function render() {
			var _this = this;

			var source = new _webpackSources.ConcatSource();
			var elements = Object.keys(this._images).map(function (id) {
				return _this._images[id];
			}).sort();
			var content = JSON.stringify(elements.join('')).slice(1, -1); // remove quotes

			source.add(SCRIPT_HEADER);
			source.add(_util2.default.format(SPRITE_CONTENT_TEMPLATE, content));
			source.add(SCRIPT_FOOTER);

			return source;
		}

		/**
   * Default sprite processor
   * @param {string} id image id
   * @param {string} content image content
   * @param {string} spritePath
   * @returns {string} sprite html
   */

	}, {
		key: '_processSpriteContent',
		value: function _processSpriteContent(id, content, spritePath) {
			var $ = _cheerio2.default.load(content, {
				xmlMode: true
			});

			var $rootTag = $.root().children().first();
			if (!$rootTag.is(ALLOWED_ROOT_TAGS.join(', '))) {
				throw new Error('\'' + spritePath + '\': invalid root tag. Should be one of [' + ALLOWED_ROOT_TAGS.join(', ') + ']');
			}

			var viewBox = $rootTag.attr('viewBox');

			var $symbol = $('<symbol></symbol>');
			$symbol.attr('id', id);
			$symbol.attr('viewBox', viewBox);
			$symbol.html($rootTag.html());

			if (this._preserveColors && this._preserveColors.test(spritePath)) {
				// save 'fill' attr on the root tag
				$symbol.attr('fill', $rootTag.attr('fill'));
			} else {
				$symbol.find('*').attr('fill', null);
			}

			return _cheerio2.default.html($symbol);
		}
	}]);

	return SvgSprite;
}();

exports.default = SvgSprite;