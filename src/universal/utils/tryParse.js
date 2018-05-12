const tryParse = (str) => {
  try {
    return JSON.parse(str)
  } catch (e) {
    return false
  }
}

export default tryParse
