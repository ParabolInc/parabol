const validateURL = (possiblyUrl: string): {error?: string} => {
  try {
    new URL(possiblyUrl)
  } catch(e) {
    return { error: e.message }
  }
  return {}
}

export default validateURL
