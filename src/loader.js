import path from 'path';
import cheerio from 'cheerio';
import loaderUtils from 'loader-utils';

function getIcon($el) {
	let shapeTypes = ['path', 'polygon', 'rect', 'polyline', 'circle', 'ellipse', 'line'];
	let result = '';

	shapeTypes.forEach(shape => {
		result = result || ($el(shape).length && $el(shape));
	});

	if (!!result) {
		result.attr('fill', null);
	}

	return result;
}

function getIconSymbol(data, id) {
	let $el = cheerio.load(data, {xmlMode: true});
	let icon = getIcon($el);
	let viewBox = $el('svg').attr('viewBox');
	let iconSymbol = $el('<symbol></symbol>');

	iconSymbol.attr('id', id);
	iconSymbol.attr('viewBox', viewBox);
	iconSymbol.append(icon);

	return iconSymbol;
}

function processSvg(content, id) {
	return cheerio.html(getIconSymbol(content, id));
}

module.exports = function(content) {
	let result;
	let spriteId = path.basename(this.resourcePath, '.svg');
	let query = loaderUtils.parseQuery(this.query);
	let cacheSVG = this[query.svgCacheNamespace][query.svgCacheFuncName];

	result = processSvg(content, spriteId);
	cacheSVG(result);

	return [
		'module.exports = ',
		JSON.stringify(spriteId),
		';'
	].join('');
};