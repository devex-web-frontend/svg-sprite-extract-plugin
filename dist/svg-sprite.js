'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _webpackSources = require('webpack-sources');

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
var SPRITE_CONTENT_TEMPLATE = '\n\tvar sprite = %s;\n\t';

/**
 * @type {string}
 */
var SCRIPT_FOOTER = '\n\tvar svgSprite = document.createElementNS(\'http://www.w3.org/2000/svg\', \'svg\');\n\tsvgSprite.id = \'svg_assets\';\n\tsvgSprite.height = 0;\n\tsvgSprite.width = 0;\n\tsvgSprite.style = \'position: absolute; right: 100%; visibility: hidden\';\n\tsvgSprite.innerHTML = sprite;\n\t\n\tif (document.body) {\n\t\tdocument.body.insertBefore(svgSprite, document.body.firstChild);\n\t} else {\n\t\tdocument.addEventListener(\'DOMContentLoaded\', function() {\n\t\t\tdocument.body.insertBefore(svgSprite, document.body.firstChild)\n\t\t});\n\t}\n})();';

/**
 * Representation of the result spritesheet.
 * Stores all sprites and renders them to output javascript.
 * @class
 */

var SvgSprite = function () {
	function SvgSprite() {
		_classCallCheck(this, SvgSprite);

		this._elements = [];
	}
	/**
  * Sprites.
  * @type {Array<string>}
  * @private
  */


	_createClass(SvgSprite, [{
		key: 'append',


		/**
   * Add a new sprite to this spritesheet.
   * @param {string} content Sprite's content
   */
		value: function append(content) {
			this._elements.push(content);
		}

		/**
   * Render spritesheet to javascript.
   * @returns {ConcatSource} an object suitable for compilation.assets collection.
   */

	}, {
		key: 'render',
		value: function render() {
			var source = new _webpackSources.ConcatSource();
			var elements = this._elements.slice();

			source.add(SCRIPT_HEADER);
			source.add(_util2.default.format(SPRITE_CONTENT_TEMPLATE, JSON.stringify(elements.join(''))));
			source.add(SCRIPT_FOOTER);

			return source;
		}
	}]);

	return SvgSprite;
}();

exports.default = SvgSprite;