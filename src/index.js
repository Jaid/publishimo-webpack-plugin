import path from "path"

import publishimo from "publishimo"

export default class {

  constructor(options) {
    this.options = {
      publishimo,
      filename: "package.json",
      publishimoOptions: {},
      format: false,
      autoMain: true,
      ...options,
    }
    if (this.options.format === true) {
      this.options.format = 2
    }
  }

  apply(compiler) {
    compiler.hooks.emit.tapPromise("PublishimoWebpackPlugin", async compilation => {
      const publishimoConfig = {
        pkg: compilation.compiler.context,
        ...this.options.publishimoOptions,
      }
      const publishimoResult = publishimo(publishimoConfig)
      const pkg = publishimoResult.generatedPkg
      if (this.options.autoMain) {
        const chunkPath = path.join(compilation.outputOptions.path, compilation.chunks[0].files[0])
        const pathRelation = path.relative(compilation.outputOptions.path, chunkPath)
        pkg.main = pathRelation
      }
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