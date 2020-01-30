const getSafeRegex = (pattern?: string | null, flags?: string) => {
  try {
    return new RegExp(pattern!, flags)
  } catch (e) {
    return new RegExp('', flags)
  }
}

export default getSafeRegex
