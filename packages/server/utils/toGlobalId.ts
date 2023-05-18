const charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_:'

function toGlobalId(type: string, id: number) {
  const str = `${type}:${id}`
  let encoded = ''
  for (let i = 0; i < str.length; i++) {
    const charIndex = charSet.indexOf(str[i])
    if (charIndex === -1) {
      throw new Error(`Invalid character ${str[i]} in type or id`)
    }
    const newIndex = (charIndex + 13) % charSet.length
    encoded += charSet[newIndex]
  }
  return encoded
}

export default toGlobalId
