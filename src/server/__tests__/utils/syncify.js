export default async (fn) => {
  try {
    const result = await fn()
    return () => {
      return result
    }
  } catch (e) {
    return () => {
      throw e
    }
  }
}
