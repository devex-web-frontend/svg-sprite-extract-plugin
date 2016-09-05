# Webpack plugin for extracting SVG

## About

The main purpose of this plugin is to minimize calls to the server for each SVG file.
To achieve this plugin collects all required SVG and writes them to a separate JS file.
When this file is added to the html page, it will add collected SVG's to the body.
So you will be able to display them with `<use xlink:href="#{id}">` tag.

## Basic usage

```js
import SVGSpriteExtractPlugin from 'svg-sprite-extract-plugin';

const svgPlugin = new SVGSpriteExtractPlugin('svg.bundle.js');

const webpackConfig = {
    module: {
        loaders: [
            {
                test: /\.svg$/,
            	loader: svgPlugin.extract()
            }
        ]
    },

    plugins: [
        svgPlugin
    ]
};
```

## Plugin

### Constructor

Plugin constructor takes output filename as first argument
and additional options object as second:

```js
new SVGSpriteExtractPlugin(outputFilename, options = {});
```

`outputFilename` can contain `[hash]` placeholder:

```js
new SVGSpriteExtractPlugin('my.svg.bundle.[hash].js');
```

### .extract(loaders = [])

This method returns a configured loader string for this plugin.
As argument you can pass additional loaders which will process SVG files before their content
will reach built-in plugin loader. It should be array of strings or single "!" separated string.

```js
// Returns path\to\this\loader\loader.js!svgo!other!etc
plugin.extract('svgo!other!etc');

// equivalent
plugin.extract(['svgo', 'other', 'etc']);
```

## Options

* **idTemplate: String** - *default*: `[name]` - sprite id. You can use all built-in webpack placeholders here.
Slashes and backslashes will be replaced with a dash. Other symbols unallowed in HTML identifiers will be removed.
* **context: String** - *default*: `.` - root path from which `[path]` placeholders in ids will be resolved
* **preserveColors: RegExp** - *default*: `null` - the plugin removes `fill` attributes from sprites by default. If
you want to save them, provide a RegExp, which will be used to detect colored sprites.
* **spriteProcessor: (id: String, content: String, spritePath: String): String** - a function to override built-in
sprite processing logic. Returned value will be injected into the sprite.

## Loader

The built-in loader processes SVG content. It expects each imported file has `<svg>` or 
`<symbol>` root tag. The loader sets `id` attribute on the sprite which you can use in your code when 
you require SVG file.

```js
// editIcon equals to processed idTemplate
import editIcon from './icons/edit-icon.svg';

// now, for example, you can create <use> tag (jsx here):
const Icon = (
    <svg>
        <use xlinkHref={`#${editIcon}`}></use>
    </svg>	
);
```