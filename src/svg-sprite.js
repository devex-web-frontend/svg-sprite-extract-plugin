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
	var sprite = "<svg xmlns=\\"http://www.w3.org/2000/svg\\">%s</svg>";
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
 * Stores all images and renders them to output javascript.
 * @class
 */
class SvgSprite {
	/**
	 * Name of this spritesheet.
	 * @type {string}
	 * @private
	 */
	_name;

	/**
	 * Images by id.
	 * @type {Object<string, string>}
	 * @private
	 */
	_images = {};

	/**
	 * @param {string} name
	 */
	constructor(name) {
		this._name = name;
	}

	/**
	 * Add a new image to this spritesheet if it is not currently stored.
	 * @param {string} id image id
	 * @param {string} content image content
	 * @throws Will throw an error if the image with such id is currently in this spritesheet.
	 */
	append(id, content) {
		if (this.contains(id)) {
			throw new Error(`Duplicated image with the same id: '${id}'.`);
		}

		this._images[id] = content;
	}

	/**
	 * Check if the image with such id is currently in the sprite.
	 * @param {string} id image id
	 * @returns {boolean}
	 */
	contains(id) {
		return id in this._images;
	}

	/**
	 * Render spritesheet to javascript.
	 * @returns {ConcatSource} an object suitable for compilation.assets collection.
	 */
	render() {
		const source = new ConcatSource();
		const elements = Object.keys(this._images).map(id => this._images[id]);
		const content = JSON.stringify(elements.join('')).slice(1, -1); // remove quotes

		source.add(SCRIPT_HEADER);
		source.add(util.format(SPRITE_CONTENT_TEMPLATE, content));
		source.add(SCRIPT_FOOTER);

		return source;
	}
}

export default SvgSprite;