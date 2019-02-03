import stringifyAuthor from "stringify-author"

const copyrightString = "Copyright ©"

export default pkg => {
  const lines = []
  // Name and version
  if (pkg.version) {
    lines.push(`${pkg.name} ${pkg.version}`)
  } else {
    lines.push(pkg.name)
  }
  // Copyright
  const year = (new Date).getFullYear()
  const prefix = `${copyrightString} ${year}`
  if (typeof pkg.author === "object") {
    const author = stringifyAuthor(pkg.author)
    lines.push(`${prefix}, ${author}`)
  } else {
    lines.push(prefix)
  }
  // License
  if (pkg.license) {
    lines.push(`@license ${pkg.license}`)
  }
  // Homepage
  if (pkg.homepage) {
    lines.push(`See ${pkg.homepage}`)
  } else if (pkg.author ?.url) {
    lines.push(`See ${pkg.author.url}`)
  }
  return lines
}