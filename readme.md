# publishimo-webpack-plugin


Webpack plugin that creates a publishimo-enhanced package.json in the output folder.

## Installation
<a href='https://npmjs.com/package/publishimo-webpack-plugin'><img alt='npm logo' src='https://raw.githubusercontent.com/npm/logos/master/npm%20logo/npm-logo-red.png' height=16/></a>
```bash
npm install --save publishimo-webpack-plugin@^
```
<a href='https://yarnpkg.com/package/publishimo-webpack-plugin'><img alt='Yarn logo' src='https://raw.githubusercontent.com/yarnpkg/assets/master/yarn-kitten-full.png' height=24/></a>
```bash
yarn add publishimo-webpack-plugin@^
```


## Try it out
Open a browser's JavaScript console and execute:

```javascript
const scriptElement = document.createElement("script");
scriptElement.setAttribute("type","text/javascript");
scriptElement.setAttribute("src","https://unpkg.com/publishimo-webpack-plugin@2.0.0");
document.querySelector("head").appendChild(scriptElement);
```

The module is now loaded in a variable.

```javascript
typeof publishimo-webpack-plugin.default
```

## Documentation

* [publishimo-webpack-plugin](#module_publishimo-webpack-plugin)
    * [module.exports](#exp_module_publishimo-webpack-plugin--module.exports) ⏏
        * [new module.exports([options])](#new_module_publishimo-webpack-plugin--module.exports_new)
        * [~pluginOptions](#module_publishimo-webpack-plugin--module.exports..pluginOptions) : <code>object</code>

**Kind**: Exported class  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>pluginOptions</code> | Plugin options |

**Kind**: inner typedef of [<code>module.exports</code>](#exp_module_publishimo-webpack-plugin--module.exports)  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [publishimo] | <code>function</code> |  | Publishimo instance, just in case you want to override the required publishimo package with a newer or manually patched version |
| [filename] | <code>string</code> | <code>&quot;\&quot;package.json\&quot;&quot;</code> | Output file name |
| [format] | <code>boolean</code> \| <code>number</code> | <code>false</code> | If true, formats JSON output and indents for readability. If a number is given, it will be the indent width in spaces. If `true`, the indent with is `2`. |
| [autoMain] | <code>boolean</code> | <code>true</code> | If true, automatically set `main` field. If a string is given, it will be the key instead of `"main"`. |
| [autoTypes] | <code>boolean</code> | <code>false</code> | If true, automatically set `types` field. |
| [banner] | <code>boolean</code> | <code>true</code> | If true, add license banner to ouput script. |
| [unicodeCopyright] | <code>boolean</code> | <code>true</code> | If true, uses `©` instead of `(c)` in banner. |
| [productionOnly] | <code>boolean</code> | <code>true</code> | If true, only applies changes and emits files in Webpack mode `production`. |
| [debugFolder] | <code>string</code> | <code>null</code> | Directory where debug info files get written to. |
| [json5] | <code>boolean</code> | <code>false</code> | If true, package output will be written with `json5.stringify` instead of `JSON.stringify`. |
| [autoExclude] | <code>boolean</code> | <code>false</code> | If `true`, unneeded fields will be guessed and automatically excluded from output package. |
| [includeFields] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | Field names that should forcefully be forwarded from `options.pkg` to generated pkg. For example, use `includeFields: ["babel"]` to include your Babel config in your output package. |
| [excludeFields] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | Fields names that are never written to generated pkg. |
| [binName] | <code>Array.&lt;string&gt;</code> |  |  |
| [includeDefaultBinName] | <code>boolean</code> | <code>true</code> |  |



## License
```text
MIT License

Copyright © 2019, Jaid <jaid.jsx@gmail.com> (github.com/jaid)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
