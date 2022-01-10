const VALID_TYPES = ['string', 'number']
const INVALID_WORDS = ['color', 'name', 'description', 'environment']
const INVALID_NOT_SIMPLIFIED_FIELD = 'story point estimate'
const INVALID_SIMPLIFIED_FIELD = 'story points'

export const isValidEstimationField = (
  fieldType: string,
  fieldName: string,
  simplified: boolean
) => {
  if (!VALID_TYPES.includes(fieldType)) return false
  const fieldNameLower = fieldName.toLowerCase()
  for (let i = 0; i < INVALID_WORDS.length; i++) {
    if (fieldNameLower.includes(INVALID_WORDS[i]!)) return false
  }

  if (
    (!simplified && fieldNameLower === INVALID_NOT_SIMPLIFIED_FIELD) ||
    (simplified && fieldNameLower === INVALID_SIMPLIFIED_FIELD)
  ) {
    return false
  }

  return true
}
