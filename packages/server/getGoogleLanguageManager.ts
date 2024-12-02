import GoogleLanguageManager from './GoogleLanguageManager'
import {Logger} from './utils/Logger'

const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL
const privateKey = (process.env.GOOGLE_CLOUD_PRIVATE_KEY || '').replace(/\\n/gm, '\n')
const privateKeyId = process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID
const disabled = !!process.env.DISABLE_GOOGLE_CLOUD_NATURAL_LANGUAGE

if (!disabled && (!clientEmail || !privateKeyId || !privateKey)) {
  Logger.warn('Google Cloud Natural Language API is disabled because of missing credentials')
}

let languageManager: GoogleLanguageManager
const getGoogleLanguageManager = () => {
  if (disabled || !clientEmail || !privateKeyId || !privateKey) {
    return null
  }
  if (!languageManager) {
    languageManager = new GoogleLanguageManager({clientEmail, privateKey, privateKeyId})
  }
  return languageManager
}

export default getGoogleLanguageManager
