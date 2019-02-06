import webpackConfigJaid from "webpack-config-jaid"

export default webpackConfigJaid({
  type: "libClass",
  documentation: true,
  publishimo: {
    publishimoOptions: {
      fetchGithub: true,
    },
  },
})