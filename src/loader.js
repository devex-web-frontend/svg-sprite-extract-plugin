import {getOptions, interpolateName} from 'loader-utils';

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
module.exports = function(content) {
	this.cacheable && this.cacheable();
	const options = getOptions(this);
	const {storeSvgFuncName, idTemplate, context = '.'} = options;
	const storeSvg = this[storeSvgFuncName];

	const id = escapeId(interpolateName(this, idTemplate, {
		content,
		context
	}));

	storeSvg(id, content, this.resourcePath);

	return `module.exports = ${JSON.stringify(id)};`;
};