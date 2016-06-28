import cheerio from 'cheerio';
import loaderUtils from 'loader-utils';

/**
 * @type {string[]}
 */
const ALLOWED_TAGS = [
	'path',
	'polygon',
	'rect',
	'polyline',
	'circle',
	'ellipse',
	'line',
	'defs',
	'style',
	'g'
];

/**
 * Create a new Cheerio object containing only allowed content from the original SVG.
 * @param {*} $svg Cheerio object for original <svg>.
 * @returns {*} A new Cheerio object for normalized content
 */
function getNormalizedContent($svg) {
	return $svg
		.children()
		.filter(ALLOWED_TAGS.join(', '))
		.attr('fill', null); // we don't need predefined fill color
}

/**
 * Creates <symbol> from raw <svg> content.
 * @param {string} content Sprite content
 * @param {string} id Sprite id
 * @returns {*} Cheerio object for <symbol>.
 */
function createSymbol(content, id) {
	const $ = cheerio.load(content, {
		xmlMode: true
	});

	const $svg = $('svg');
	const viewBox = $svg.attr('viewBox');
	const $symbol = $('<symbol></symbol>');

	const $content = getNormalizedContent($svg);

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
	return cheerio.html(createSymbol(content, id));
}

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
	//noinspection JSUnresolvedVariable,JSUnresolvedFunction
	this.cacheable && this.cacheable();

	//noinspection JSUnresolvedVariable
	const query = loaderUtils.parseQuery(this.query);
	const {context = '.'} = query;
	const cacheSVG = this[query.svgCacheNamespace][query.svgCacheFuncName];

	const spriteId = escapeId(loaderUtils.interpolateName(this, query.idTemplate, {
		content,
		context
	}));

	const result = processSvg(content, spriteId);
	cacheSVG(result);

	return `module.exports = ${JSON.stringify(spriteId)};`;
};