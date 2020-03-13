import GoogleLanguageManager from './GoogleLanguageManager'

const clientEmail = process.env.GOOGLE_CLOUD_CLIENT_EMAIL
const privateKey = (process.env.GOOGLE_CLOUD_PRIVATE_KEY || '').replace(/\\n/gm, '\n')
const privateKeyId = process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID

let languageManager: GoogleLanguageManager
const getGoogleLanguageManager = () => {
  if (!languageManager) {
    if (!clientEmail || !privateKeyId || !privateKey) {
      throw new Error('Missing Google Cloud Credentials in ENV')
    }
    languageManager = new GoogleLanguageManager({clientEmail, privateKey, privateKeyId})
  }
  return languageManager
}

export default getGoogleLanguageManager
