import {ConcatSource} from 'webpack-sources';
import cheerio from 'cheerio';
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
	var svgSprite = document.createElement('div');
	svgSprite.id = 'svg_assets';
	svgSprite.height = 0;
	svgSprite.width = 0;
	svgSprite.setAttribute('style', 'position: absolute; right: 100%; visibility: hidden;');
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
 * @type {string[]}
 */
const ALLOWED_ROOT_TAGS = [
	'svg',
	'symbol'
];

/**
 * Representation of the result spritesheet.
 * Stores all images and renders them to output javascript.
 * @class
 */
class SvgSprite {
	/**
	 * Images by id.
	 * @type {Object<string, string>}
	 * @private
	 */
	_images = {};

	/**
	 * Regex for sprites which colors shouldn't be removed
	 * @type {RegExp}
	 * @private
	 */
	_preserveColors;

	/**
	 * Function for processing sprite content before it would be stored in the result.
	 * @type {Function}
	 * @private
	 */
	_spriteProcessor;

	constructor(preserveColors = null, customSpriteProcessor = null) {
		this._preserveColors = preserveColors;
		this._spriteProcessor = typeof customSpriteProcessor === 'function' ?
			customSpriteProcessor : this._processSpriteContent;
	}

	/**
	 * Add a new image to this spritesheet if it is not currently stored.
	 * @param {string} id image id
	 * @param {string} content image content
	 * @param {string} spritePath
	 * @throws Will throw an error if the image with such id is currently in this spritesheet.
	 */
	append(id, content, spritePath) {
		if (this.contains(id)) {
			throw new Error(`'${spritePath}': duplicated id - '${id}'`);
		}

		this._images[id] = this._spriteProcessor(id, content, spritePath);
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
		const elements = Object.keys(this._images).map(id => this._images[id]).sort();
		const content = JSON.stringify(elements.join('')).slice(1, -1); // remove quotes

		source.add(SCRIPT_HEADER);
		source.add(util.format(SPRITE_CONTENT_TEMPLATE, content));
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
	_processSpriteContent(id, content, spritePath) {
		const $ = cheerio.load(content, {
			xmlMode: true
		});

		const $rootTag = $.root().children().first();
		if (!$rootTag.is(ALLOWED_ROOT_TAGS.join(', '))) {
			throw new Error(
				`'${spritePath}': invalid root tag. Should be one of [${ALLOWED_ROOT_TAGS.join(', ')}]`
			);
		}

		const viewBox = $rootTag.attr('viewBox');
		if (!viewBox) {
			throw new Error(`'${spritePath}': sprite should have a valid 'viewbox' attribute`);
		}

		const $symbol = $('<symbol></symbol>');
		$symbol.attr('id', id);
		$symbol.attr('viewBox', viewBox);
		$symbol.html($rootTag.html());

		if (this._preserveColors && this._preserveColors.test(spritePath)) {
			// save 'fill' attr on the root tag
			$symbol.attr('fill', $rootTag.attr('fill'));
		} else {
			$symbol.find('*').attr('fill', null);
		}

		return cheerio.html($symbol);
	}
}

export default SvgSprite;