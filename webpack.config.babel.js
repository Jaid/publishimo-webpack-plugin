import webpackConfigJaid from "webpack-config-jaid"

export default webpackConfigJaid({
  type: "libClass",
  documentation: {
    babel: true,
  },
  publishimo: {
    publishimoOptions: {
      fetchGithub: true,
    },
  },
})