const charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_:'

function fromGlobalId(globalId: string) {
  let decoded = ''
  for (let i = 0; i < globalId.length; i++) {
    const charIndex = charSet.indexOf(globalId[i])
    if (charIndex === -1) {
      throw new Error(`Invalid character ${globalId[i]} in globalId`)
    }
    const newIndex = (charIndex - 13 + charSet.length) % charSet.length
    decoded += charSet[newIndex]
  }
  const [type, id] = decoded.split(':')
  return {type, id: parseInt(id, 10)}
}

export default fromGlobalId
