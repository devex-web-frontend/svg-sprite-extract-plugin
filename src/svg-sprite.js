import {ConcatSource} from 'webpack-sources';
import util from 'util';

const SCRIPT_HEADER = `(function() {`;

const SPRITE_CONTENT_TEMPLATE =
	`
	var sprite = %s;
	`;

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

class SvgSprite {
	_elements = [];

	append(content) {
		this._elements.push(content);
	}

	render() {
		let source = new ConcatSource();
		let elements = this._elements.slice();

		source.add(SCRIPT_HEADER);
		source.add(util.format(SPRITE_CONTENT_TEMPLATE, JSON.stringify(elements.join(''))));
		source.add(SCRIPT_FOOTER);

		return source;
	}
}

export default SvgSprite;