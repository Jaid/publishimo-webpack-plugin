import path from "path"

import publishimo from "publishimo"
import {ConcatSource} from "webpack-sources"
import {isString} from "lodash"
import {AsyncParallelHook} from "tapable"
import fss from "@absolunet/fss"
import json5 from "json5"

import generateBanner from "./generateBanner"
import formatBanner from "./formatBanner"

const webpackId = "PublishimoWebpackPlugin"
const pkgHook = "publishimoGeneratedPkg"

export default class {

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
      json5: false,
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
      fss.outputJson5(outputPath, data, {format: 2})
    }
  }

  apply(compiler) {
    if (this.options.productionOnly && compiler.options.mode !== "production") {
      return
    }
    if (compiler.hooks[pkgHook]) {
      throw new Error(`Webpack hook compiler.hooks.${pkgHook} is already registered`)
    }
    compiler.hooks[pkgHook] = new AsyncParallelHook(["publishimoResult"])
    let publishimoResult
    compiler.hooks.compilation.tap(webpackId, compilation => {
      compilation.hooks.optimizeChunkAssets.tapPromise(webpackId, async chunks => {
        const publishimoConfig = {
          pkg: compiler.context,
          ...this.options,
        }
        const chunkPath = path.join(compilation.outputOptions.path, compilation.chunks[0].files[0])
        const mainPath = path.relative(compilation.outputOptions.path, chunkPath)
        if (this.options.autoMain) {
          const fieldKey = isString(this.options.autoMain) ? this.options.autoMain : "main"
          publishimoConfig[fieldKey] = mainPath
        }
        if (this.options.autoTypes) {
          publishimoConfig.types = mainPath
        }
        publishimoResult = await publishimo(publishimoConfig)
        this.outputDebugFile("options.json5", this.options)
        this.outputDebugFile("publishimoResult.json5", publishimoResult)
        compiler.hooks[pkgHook].promise(publishimoResult)
        if (this.options.banner) {
          const banner = do {
            if (this.options.banner === true) {
              generateBanner(publishimoResult.generatedPkg, this.options)
            } else if (typeof this.options.banner === "function") {
              this.options.banner(publishimoResult.generatedPkg)
            } else if (typeof this.options.banner === "string") {
              this.options.banner
            } else {
              "?"
            }
          }
          const finalBanner = formatBanner(banner)
          this.outputDebugFile("banner.js", finalBanner)
          for (const chunk of chunks) {
            for (const file of chunk.files) {
              compilation.assets[file] = new ConcatSource(finalBanner, "\n", compilation.assets[file])
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

}