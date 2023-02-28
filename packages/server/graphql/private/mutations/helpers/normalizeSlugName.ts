export default (name: string) => {
  const normalizedName = name.trim().toLowerCase()
  const nameRegex = /^[a-z0-9_-]+$/
  if (!nameRegex.test(normalizedName)) {
    return new Error('Name must be letters and numbers or _ or - with no spaces')
  }
  return normalizedName
}
