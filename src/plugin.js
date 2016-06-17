import SvgSprite from './svg-sprite';

const DEFAULT_OPTIONS = {
	svgCacheNamespace: 'cacheSvg',
	svgCacheFuncPrefix: 'cacheSvg_'
};

let pluginId = 0;

class SVGSpriteExtractPlugin {
	id;
	filename;
	options;

	constructor(filename, options) {
		if (!filename) {
			throw new Error('You should provide a filename for SVG sprite');
		}

		this.id = pluginId++;
		this.filename = filename;
		
		this.options = Object.assign({}, DEFAULT_OPTIONS, options);
		this.options.id = this.id;
		this.options.svgCacheFuncName = this.options.svgCacheFuncPrefix + this.id;
	}

	extract(loader = []) {
		let {svgCacheNamespace, svgCacheFuncName} = this.options;

		if (typeof loader === 'string') {
			loader = loader.split('!');
		}

		return [
			require.resolve('./loader') + '?' + JSON.stringify({svgCacheNamespace, svgCacheFuncName})
		].concat(loader).join('!');
	}

	apply(compiler) {
		let {svgCacheNamespace, svgCacheFuncName} = this.options;

		let sprite = new SvgSprite();
		let cacheFunc = svgContent => sprite.append(svgContent);

		compiler.plugin('compilation', compilation => {
			compilation.plugin('normal-module-loader', (loaderContext, module) => {
				loaderContext[svgCacheNamespace] = loaderContext[svgCacheNamespace] || [];
				loaderContext[svgCacheNamespace][svgCacheFuncName] = cacheFunc;
			});
		});

		compiler.plugin('emit', (compilation, callback) => {
			compilation.assets[this.filename] = sprite.render();
			callback();
		});
	}
}

export default SVGSpriteExtractPlugin;