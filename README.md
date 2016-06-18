# Webpack plugin for extracting SVG

## About

The main purpose of this plugin is to minimize calls to the server for each SVG file.
To achieve this plugin collects all required SVG and writes them to a separate JS file.
When this file is added to the html page, it will add collected SVG's to the body.
So you will be able to display SVG with `<use>` tag, for example.

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

## Loader

The built-in loader processes SVG content. It expects each required file has `<svg>` root tag.
The loader extracts allowed content from the root and adds it to a new `<symbol>` tag which
would be passed to the output svg bundle.

The loader also sets id attribute which equals to the filename without extension.
You can use it in your code when you require SVG file.

```js
// editIcon equals to 'edit-icon'
import editIcon from './icons/edit-icon.svg';

// now, for example, you can create <use> tag
```