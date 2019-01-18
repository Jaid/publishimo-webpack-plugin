const toComment = string => `/*!\n${string}\n!*/`

export default lines => {
  if (typeof lines === "string") {
    lines = lines.split("\n")
  }
  return lines
    .map(line => `*** ${line}`)
    .join("\n")
    |> toComment
}