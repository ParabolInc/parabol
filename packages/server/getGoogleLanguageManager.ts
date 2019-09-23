import GoogleLanguageManager from './GoogleLanguageManager'

let languageManager: GoogleLanguageManager
const getGoogleLanguageManager = () => {
  if (!languageManager) {
    const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
    languageManager = new GoogleLanguageManager(serviceAccount)
  }
  return languageManager
}

export default getGoogleLanguageManager
