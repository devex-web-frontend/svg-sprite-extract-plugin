import {ConcatSource} from 'webpack-sources';
import util from 'util';

/**
 * @type {string}
 */
const SCRIPT_HEADER = '(function() {';

/**
 * @type {string}
 */
const SPRITE_CONTENT_TEMPLATE =
	`
	var sprite = %s;
	`;

/**
 * @type {string}
 */
const SCRIPT_FOOTER =
	`
	var svgSprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svgSprite.id = 'svg_assets';
	svgSprite.height = 0;
	svgSprite.width = 0;
	svgSprite.style = 'position: absolute; right: 100%; visibility: hidden';
	svgSprite.innerHTML = sprite;
	
	if (document.body) {
		document.body.insertBefore(svgSprite, document.body.firstChild);
	} else {
		document.addEventListener('DOMContentLoaded', function() {
			document.body.insertBefore(svgSprite, document.body.firstChild)
		});
	}
})();`;

/**
 * Representation of the result spritesheet.
 * Stores all sprites and renders them to output javascript.
 * @class
 */
class SvgSprite {
	/**
	 * Sprites.
	 * @type {Array<string>}
	 * @private
	 */
	_elements = [];

	/**
	 * Add a new sprite to this spritesheet.
	 * @param {string} content Sprite's content
	 */
	append(content) {
		this._elements.push(content);
	}

	/**
	 * Render spritesheet to javascript.
	 * @returns {ConcatSource} an object suitable for compilation.assets collection.
	 */
	render() {
		const source = new ConcatSource();
		const elements = this._elements.slice();

		source.add(SCRIPT_HEADER);
		source.add(util.format(SPRITE_CONTENT_TEMPLATE, JSON.stringify(elements.join(''))));
		source.add(SCRIPT_FOOTER);

		return source;
	}
}

export default SvgSprite;