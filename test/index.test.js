import path from "path"

import webpack from "webpack"
import pify from "pify"
import loadJsonFile from "load-json-file"
import CleanWebpackPlugin from "clean-webpack-plugin"

import PublishimoWebpackPlugin from "../src"

const getWepbackConfig = name => ({
  target: "node",
  mode: "production",
  devtool: "inline-source-map",
  context: path.join(__dirname, name),
  entry: path.join(__dirname, name, "src"),
  output: {
    path: path.join(__dirname, name, "dist"),
  },
})

it("should run", async () => {
  const webpackConfig = {
    ...getWepbackConfig("basic"),
    plugins: [
      new CleanWebpackPlugin,
      new PublishimoWebpackPlugin,
    ],
  }
  await pify(webpack)(webpackConfig)
  const output = await loadJsonFile(path.join(__dirname, "basic", "dist", "package.json"))
  expect(output).toMatchObject({
    license: "MIT",
    name: "basic",
    version: "1.0.0",
  })
})

it("should run with configuration", async () => {
  const pkg = {
    license: "Apache 2",
    name: "configured",
    version: "1.2.3",
  }
  const webpackConfig = {
    ...getWepbackConfig("configured"),
    output: {
      path: path.join(__dirname, "configured", "dist"),
      filename: "out/[name].js",
    },
    plugins: [
      new CleanWebpackPlugin,
      new PublishimoWebpackPlugin({
        filename: "pkg.json",
        publishimoOptions: {
          pkg,
          config: {
            author: "Jaid",
            github: true,
          },
        },
      }),
    ],
  }
  await pify(webpack)(webpackConfig)
  const output = await loadJsonFile(path.join(__dirname, "configured", "dist", "pkg.json"))
  expect(output).toMatchObject(pkg)
  expect(output.main).toBe("out/main.js")
})