/** @module publishimo-webpack-plugin */

import fss from "@absolunet/fss"
import arrayToObjectKeys from "array-to-object-keys"
import ensureArray from "ensure-array"
import json5 from "json5"
import {isObject, isString} from "lodash"
import path from "path"
import publishimo from "publishimo"
import sortKeys from "sort-keys"
import {AsyncParallelHook} from "tapable"
import webpack from "webpack"
import {ConcatSource} from "webpack-sources"

import formatBanner from "./formatBanner"
import generateBanner from "./generateBanner"

const webpackId = process.env.REPLACE_PKG_NAME
const hookName = "publishimoGeneratedPkg"

/**
 * @typedef pluginOptions
 * @type {object}
 * @property {function} [publishimo] Publishimo instance, just in case you want to override the required publishimo package with a newer or manually patched version
 * @property {string} [filename="package.json"] Output file name
 * @property {boolean|number} [format=false] If true, formats JSON output and indents for readability. If a number is given, it will be the indent width in spaces. If `true`, the indent with is `2`.
 * @property {boolean} [autoMain=true] If true, automatically set `main` field. If a string is given, it will be the key instead of `"main"`.
 * @property {boolean} [autoTypes=false] If true, automatically set `types` field.
 * @property {boolean} [banner=true] If true, add license banner to ouput script.
 * @property {boolean} [unicodeCopyright=true] If true, uses `©` instead of `(c)` in banner.
 * @property {boolean} [productionOnly=true] If true, only applies changes and emits files in Webpack mode `production`.
 * @property {string} [debugFolder=null] Directory where debug info files get written to.
 * @property {boolean} [json5=false] If true, package output will be written with `json5.stringify` instead of `JSON.stringify`.
 * @property {boolean} [autoExclude=false] If `true`, unneeded fields will be guessed and automatically excluded from output package.
 * @property {string[]} [includeFields=[]] Field names that should forcefully be forwarded from `options.pkg` to generated pkg. For example, use `includeFields: ["babel"]` to include your Babel config in your output package.
 * @property {string[]} [excludeFields=[]] Fields names that are never written to generated pkg.
 * @property {string[]} [binName]
 * @property {boolean} [includeDefaultBinName=true]
 */

/**
 * @class
 */
export default class PublishimoWebpackPlugin {

  static hooksMap = new WeakMap;

  /**
   * @constructor
   * @param {pluginOptions} [options] Plugin options
   */
  constructor(options) {
    this.options = {
      publishimo,
      filename: "package.json",
      format: false,
      autoMain: true,
      autoTypes: false,
      banner: true,
      unicodeCopyright: true,
      productionOnly: true,
      debugFolder: null,
      incudeFields: [],
      excludeFields: [],
      json5: false,
      autoExclude: false,
      includeDefaultBinName: true,
      ...options,
    }
    if (this.options.format === true) {
      this.options.format = 2
    }
  }

  outputDebugFile(filename, data) {
    if (!this.options.debugFolder) {
      return
    }
    const outputPath = path.join(this.options.debugFolder, filename)
    if (typeof data === "string") {
      fss.outputFile(outputPath, data)
    } else {
      fss.outputJson5(outputPath, data, {space: 2})
    }
  }

  apply(compiler) {
    if (this.options.productionOnly && compiler.options.mode !== "production") {
      return
    }
    let publishimoResult
    const processAssetsTapIdentifier = {
      name: webpackId,
      stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
    }
    compiler.hooks.compilation.tap(webpackId, compilation => {
      compilation.hooks.processAssets.tapPromise(processAssetsTapIdentifier, async () => {
        const publishimoConfig = {
          pkg: compiler.context,
          ...this.options,
        }
        const chunkPath = path.join(compilation.outputOptions.path, compilation.chunks[0].files[0])
        const mainPath = path.relative(compilation.outputOptions.path, chunkPath)
        if (this.options.autoMain) {
          const fieldKey = isString(this.options.autoMain) ? this.options.autoMain : "main"
          if (fieldKey === "bin" && this.options.binName) {
            const binNames = ensureArray(this.options.binName)
            const binObject = arrayToObjectKeys(binNames, mainPath)
            publishimoConfig.bin = binObject
          } else {
            publishimoConfig[fieldKey] = mainPath
          }
        }
        if (this.options.autoTypes) {
          publishimoConfig.types = mainPath
        }
        if (this.options.autoExclude && compilation.options.target !== "node") { // Don't include dependencies in package.json if export target is not a Node module
          publishimoConfig.excludeFields = [
            ...publishimoConfig.excludeFields,
            "dependencies",
            "peerDependencies",
            "optionalDependencies",
          ]
        }
        publishimoResult = await this.options.publishimo(publishimoConfig)
        if (this.options.includeDefaultBinName && isObject(publishimoResult.generatedPkg.bin)) {
          publishimoResult.generatedPkg.bin[publishimoResult.generatedPkg.name] = mainPath
          publishimoResult.generatedPkg.bin = sortKeys(publishimoResult.generatedPkg.bin)
        }
        this.outputDebugFile("options.json5", this.options)
        this.outputDebugFile("publishimoResult.json5", publishimoResult)
        PublishimoWebpackPlugin.getHooks(compilation)[hookName].promise(publishimoResult)
        if (this.options.banner) {
          const getBanner = () => {
            if (this.options.banner === true) {
              return generateBanner(publishimoResult.generatedPkg, this.options)
            } else if (typeof this.options.banner === "function") {
              return this.options.banner(publishimoResult.generatedPkg)
            } else if (typeof this.options.banner === "string") {
              return this.options.banner
            } else {
              return "?"
            }
          }
          const finalBanner = formatBanner(getBanner())
          this.outputDebugFile("banner.js", finalBanner)
          for (const chunk of compilation.chunks) {
            for (const chunkFile of chunk.files) {
              compilation.updateAsset(chunkFile, source => new ConcatSource(finalBanner, "\n", source))
            }
          }
        }
      })
    })
    compiler.hooks.emit.tap(webpackId, compilation => {
      const fileContents = (this.options.json5 ? json5 : JSON).stringify(publishimoResult.generatedPkg, null, this.options.format || 0)
      compilation.assets[this.options.filename] = {
        source: () => fileContents,
        size: () => fileContents.length,
      }
    })
  }

  // Thanks to https://github.com/jantimon/html-webpack-plugin/blob/0a6568d587a82d88fd3a0617234ca98d26a1e0a6/lib/hooks.js#L79
  static getHooks(compilation) {
    let hooks = this.hooksMap.get(compilation)
    if (!hooks) {
      hooks = PublishimoWebpackPlugin.createHooks()
      PublishimoWebpackPlugin.hooksMap.set(compilation, hooks)
    }
    return hooks
  }

  static createHooks() {
    return {
      [hookName]: new AsyncParallelHook(["publishimoResult"]),
    }
  }

}