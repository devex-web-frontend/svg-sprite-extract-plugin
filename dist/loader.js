'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @type {string[]}
 */
var ALLOWED_TAGS = ['path', 'polygon', 'rect', 'polyline', 'circle', 'ellipse', 'line', 'defs', 'style'];

/**
 * Create a new Cheerio object containing only allowed content from the original SVG.
 * @param {*} $svg Cheerio object for original <svg>.
 * @returns {*} A new Cheerio object for normalized content
 */
function getNormalizedContent($svg) {
	return $svg.children().filter(ALLOWED_TAGS.join(', ')).attr('fill', null); // we don't need predefined fill color
}

/**
 * Creates <symbol> from raw <svg> content.
 * @param {string} content Sprite content
 * @param {string} id Sprite id
 * @returns {*} Cheerio object for <symbol>.
 */
function createSymbol(content, id) {
	var $ = _cheerio2.default.load(content, { xmlMode: true });
	var $svg = $('svg');
	var viewBox = $svg.attr('viewBox');
	var $symbol = $('<symbol></symbol>');

	var $content = getNormalizedContent($svg);

	$symbol.attr('id', id);
	$symbol.attr('viewBox', viewBox);
	$symbol.append($content);

	return $symbol;
}

/**
 * Process raw SVG content and return ready to use html of this sprite.
 * @param {string} content Sprite content
 * @param {string} id Sprite id
 * @returns {string} Sprite html
 */
function processSvg(content, id) {
	return _cheerio2.default.html(createSymbol(content, id));
}

/**
 * Loader for webpack.
 * It takes SVG file content and returns a module, exporting the id of this sprite.
 * Also it invokes a collector function, which passes SVG content to a plugin instance.
 * @param {string} content
 * @returns {string}
 */
module.exports = function (content) {
	//noinspection JSUnresolvedVariable,JSUnresolvedFunction
	this.cacheable && this.cacheable();

	var result = void 0;
	//noinspection JSUnresolvedVariable
	var spriteId = _path2.default.basename(this.resourcePath, '.svg');
	var query = _loaderUtils2.default.parseQuery(this.query);

	result = processSvg(content, spriteId);

	var cacheSVG = this[query.svgCacheNamespace][query.svgCacheFuncName];
	cacheSVG(result);

	return 'module.exports = ' + JSON.stringify(spriteId) + ';';
};