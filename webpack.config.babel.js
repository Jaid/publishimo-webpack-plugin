import {configureUniversalClass} from "webpack-config-jaid"

export default configureUniversalClass({
  documentation: {babel: true},
  publishimo: {fetchGithub: true},
})