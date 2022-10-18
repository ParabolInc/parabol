const VALID_TYPES = ['string', 'number']
const INVALID_WORDS = ['summary', 'color', 'name', 'description', 'environment']
const INVALID_ID_PREFIXES = ['aggregate']

export const isValidEstimationField = (fieldType: string, fieldName: string, fieldId: string) => {
  if (!VALID_TYPES.includes(fieldType)) return false
  const fieldNameLower = fieldName.toLowerCase()
  for (let i = 0; i < INVALID_WORDS.length; i++) {
    if (fieldNameLower.includes(INVALID_WORDS[i]!)) return false
  }
  if (INVALID_ID_PREFIXES.some((prefix) => fieldId.startsWith(prefix))) return false

  return true
}
