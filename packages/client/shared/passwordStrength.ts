import {zxcvbn, zxcvbnOptions} from '@zxcvbn-ts/core'
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common'
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en'
import {Security} from '../types/constEnums'

const options = {
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary
  },
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  useLevenshteinDistance: true,
  translations: zxcvbnEnPackage.translations
}
zxcvbnOptions.setOptions(options)

const dictFromEmail = (email?: string) => {
  if (!email) return []
  const dict = email.split(/[\W_]+/).filter(Boolean)
  // include parts of the email with separators to improve matching performance and lower the score
  const extraDict = dict.flatMap((part) => email.split(part).filter(Boolean))
  return [email, ...dict, ...extraDict]
}

export const passwordStrength = (password: string, email?: string) => {
  if (password.length < Security.MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${Security.MIN_PASSWORD_LENGTH} characters`
  }
  const result = zxcvbn(password, dictFromEmail(email))
  if (result.score < 3) {
    const feedback = result.feedback.suggestions.join(' ')
    return `Password is too weak. ${feedback}`
  }
  return undefined
}
