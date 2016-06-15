import {ConcatSource} from 'webpack-sources';
import util from 'util';

const SVG_OPEN = [
	'<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',
	'xmlns:xlink="http://www.w3.org/1999/xlink"',
	'id="assets" height="0" width="0"',
	'style="position: absolute; margin-left: -100%;">'
].join(' ');

const SVG_CLOSE = '</svg>';

const SCRIPT_HEADER_TMPL = [
	'(function() {',
	'var sprite = %s;\n'
].join('\n');

const SCRIPT_FOOTER = [
	'var svgWrap = document.createElement("div");',
	'svgWrap.style = "display: none;";',
	'svgWrap.innerHTML = sprite;',
	'if (document.body) {',
	'document.body.insertBefore(svgWrap, document.body.firstChild);',
	'} else {',
	'document.addEventListener("DOMContentLoaded", function() {',
	'document.body.insertBefore(svgWrap, document.body.firstChild)',
	'});',
	'}',
	'})();'
].join('\n');

class SvgSprite {
	_elements = [];

	append(content) {
		this._elements.push(content);
	}

	render() {
		let source = new ConcatSource();
		let elements = this._elements.slice();

		elements.unshift(SVG_OPEN);
		elements.push(SVG_CLOSE);

		source.add(util.format(SCRIPT_HEADER_TMPL, JSON.stringify(elements.join(''))));
		source.add(SCRIPT_FOOTER);

		return source;
	}
}

export default SvgSprite;