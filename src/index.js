import path from "path"

import publishimo from "publishimo"
import {ConcatSource} from "webpack-sources"

import generateBanner from "./generateBanner"
import formatBanner from "./formatBanner"

jest.setTimeout(60 * 1000)

export default class {

  constructor(options) {
    this.options = {
      publishimo,
      filename: "package.json",
      publishimoOptions: {},
      format: false,
      autoMain: true,
      banner: true,
      productionOnly: true,
      ...options,
    }
    if (this.options.format === true) {
      this.options.format = 2
    }
  }

  apply(compiler) {
    if (this.options.productionOnly && compiler.options.mode !== "production") {
      return
    }
    let publishimoResult
    compiler.hooks.compilation.tap("PublishimoWebpackPlugin", compilation => {
      compilation.hooks.optimizeChunkAssets.tapPromise("PublishimoWebpackPlugin", async chunks => {
        const publishimoConfig = {
          pkg: compiler.context,
          ...this.options.publishimoOptions,
        }
        if (this.options.autoMain) {
          const chunkPath = path.join(compilation.outputOptions.path, compilation.chunks[0].files[0])
          const pathRelation = path.relative(compilation.outputOptions.path, chunkPath)
          publishimoConfig.main = pathRelation
        }
        publishimoResult = await publishimo(publishimoConfig)
        if (this.options.banner) {
          let banner
          if (this.options.banner === true) {
            banner = generateBanner(publishimoResult.generatedPkg)
          } else if (typeof this.options.banner === "function") {
            banner = this.options.banner(publishimoResult.generatedPkg)
          } else if (typeof this.options.banner === "string") {
            banner = this.options.banner
          } else {
            banner = "?"
          }
          for (const chunk of chunks) {
            for (const file of chunk.files) {
              compilation.assets[file] = new ConcatSource(formatBanner(banner), "\n", compilation.assets[file])
            }
          }
        }
      })
    })
    compiler.hooks.emit.tap("PublishimoWebpackPlugin", compilation => {
      const pkg = publishimoResult.generatedPkg
      let fileContents
      if (Number.isInteger(this.options.format)) {
        fileContents = JSON.stringify(pkg, null, this.options.format)
      } else {
        fileContents = JSON.stringify(pkg)
      }
      compilation.assets[this.options.filename] = {
        source: () => fileContents,
        size: () => fileContents.length,
      }
    })
  }

}