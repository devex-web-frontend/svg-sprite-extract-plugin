import loaderUtils from 'loader-utils';
import SvgSprite from './svg-sprite';

/**
 * @typedef {Object} SVGSpriteExtractPluginOptions
 * @property {string} [idTemplate]
 * @property {string} [context]
 * @property {RegExp} [preserveColors]
 * @property {Function} [spriteProcessor]
 */

/**
 * @type {SVGSpriteExtractPluginOptions}
 */
const DEFAULT_OPTIONS = {
	idTemplate: '[name]'
};

/**
 * @type {string}
 */
const PLUGIN_NS_PREFIX = '__SVG_SPRITE_EXTRACT__';

/**
 * @type {number}
 */
let pluginId = 0;

class SVGSpriteExtractPlugin {

	/**
	 * @type {number}
	 * @private
	 */
	_id;

	/**
	 * @type {string}
	 * @private
	 */
	_filenameTemplate;

	/**
	 * @type {SVGSpriteExtractPluginOptions}
	 * @private
	 */
	_options;

	/**
	 * @type {SvgSprite}
	 * @private
	 */
	_sprite;

	/**
	 * @type {Array<Error>}
	 * @private
	 */
	_errors = [];

	/**
	 * @type {string}
	 * @private
	 */
	_exportedFuncName;

	/**
	 * @param {string} filenameTemplate
	 * @param {SVGSpriteExtractPluginOptions} [options]
	 */
	constructor(filenameTemplate, options = {}) {
		if (!filenameTemplate) {
			throw new Error('SVG-EXTRACT-PLUGIN: You should provide a filename for SVG sprite');
		} else if (options.preserveColors && !options.preserveColors.test) {
			throw new Error('SVG-EXTRACT-PLUGIN: \'preserveColors\' option should be a valid RegExp');
		} else if (options.spriteProcessor && typeof options.spriteProcessor !== 'function') {
			throw new Error('SVG-EXTRACT-PLUGIN: \'spriteProcessor\' option should be a function');
		}

		this._id = pluginId++;
		this._filenameTemplate = filenameTemplate;

		this._options = Object.assign({}, DEFAULT_OPTIONS, options);
		this._exportedFuncName = PLUGIN_NS_PREFIX + this._id;

		this._sprite = new SvgSprite(
			this._options.preserveColors,
			this._options.spriteProcessor
		);
	}

	/**
	 * Resolve loader string for this plugin instance.
	 * @param {string|Array<string>} [loader=[]]
	 * @returns {string} loader string
	 */
	extract(loader = []) {
		let beforeLoaders = loader;

		if (typeof beforeLoaders === 'string') {
			beforeLoaders = beforeLoaders.split('!');
		}

		const options = {
			idTemplate: this._options.idTemplate,
			context: this._options.context,
			storeSvgFuncName: this._exportedFuncName
		};

		return [
			{
				loader: require.resolve('./loader'),
				options
			}
		].concat(beforeLoaders);
	}

	/**
	 * Entry point to this plugin for webpack.
	 * @param {Object} compiler
	 */
	apply(compiler) {
		compiler.plugin('compilation', compilation => {
			compilation.plugin('normal-module-loader', (loaderContext, module) => {
				loaderContext[this._exportedFuncName] = this.onStore.bind(this);
			});
		});

		compiler.plugin('emit', (compilation, callback) => {
			if (this._errors.length > 0) {
				return callback(
					`SVG-EXTRACT-PLUGIN: Unable to build '${this._filenameTemplate}':\n` +
					`\t${this._errors.map(e => e.message).join('\n\t')}\n`
				);
			}

			const compiledSprite = this._sprite.render();
			const filename = loaderUtils.interpolateName({}, this._filenameTemplate, {
				content: compiledSprite.source()
			});

			compilation.assets[filename] = compiledSprite;
			callback();
		});
	}

	/**
	 * Handler for SVG images passed from loader context
	 * @param {string} id
	 * @param {string} content
	 * @param {string} spritePath
	 */
	onStore(id, content, spritePath) {
		try {
			this._sprite.append(id, content, spritePath);
		} catch (e) {
			this._errors.push(e);
		}
	}
}

export default SVGSpriteExtractPlugin;