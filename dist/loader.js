'use strict';

var _loaderUtils = require('loader-utils');

var _loaderUtils2 = _interopRequireDefault(_loaderUtils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {String} id
 * @returns {String} escaped id
 */
function escapeId(id) {
	return id.replace(/[\/\\]/g, '-').replace(/[^\w:\.\-]/g, '');
}

/**
 * Loader for webpack.
 * It takes SVG file content and returns a module, exporting the id of this sprite.
 * Also it invokes a collector function, which passes SVG content to a plugin instance.
 * @param {string} content
 * @returns {string}
 */
module.exports = function (content) {
	this.cacheable && this.cacheable();
	var query = _loaderUtils2.default.parseQuery(this.query);
	var storeSvgFuncName = query.storeSvgFuncName;
	var idTemplate = query.idTemplate;
	var _query$context = query.context;
	var context = _query$context === undefined ? '.' : _query$context;

	var storeSvg = this[storeSvgFuncName];

	var id = escapeId(_loaderUtils2.default.interpolateName(this, idTemplate, {
		content: content,
		context: context
	}));

	storeSvg(id, content, this.resourcePath);

	return 'module.exports = ' + JSON.stringify(id) + ';';
};