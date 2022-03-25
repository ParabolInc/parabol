const VALID_TYPES = ['string', 'number']
const INVALID_WORDS = ['color', 'name', 'description', 'environment']
const INVALID_ID_PREFIXES = ['aggregate']
import {SprintPokerDefaults} from '~/types/constEnums'

export const isValidEstimationField = (
  fieldType: string,
  fieldName: string,
  fieldId: string,
  simplified: boolean
) => {
  if (!VALID_TYPES.includes(fieldType)) return false
  const fieldNameLower = fieldName.toLowerCase()
  for (let i = 0; i < INVALID_WORDS.length; i++) {
    if (fieldNameLower.includes(INVALID_WORDS[i]!)) return false
  }
  if (INVALID_ID_PREFIXES.some((prefix) => fieldId.startsWith(prefix))) return false
  if (
    (!simplified && fieldNameLower === SprintPokerDefaults.JIRA_FIELD_DEFAULT.toLowerCase()) ||
    (simplified && fieldNameLower === SprintPokerDefaults.JIRA_FIELD_LEGACY_DEFAULT.toLowerCase())
  ) {
    return false
  }

  return true
}
