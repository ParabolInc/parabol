export const isValidJSON = (json: string) => {
  try {
    JSON.parse(json)
    return true
  } catch (error) {
    return false
  }
}
