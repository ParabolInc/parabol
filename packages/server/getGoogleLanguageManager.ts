import GoogleLanguageManager from './GoogleLanguageManager'

let languageManager: GoogleLanguageManager
const getGoogleLanguageManager = () => {
  if (!languageManager) {
    languageManager = new GoogleLanguageManager()
  }
  return languageManager
}

export default getGoogleLanguageManager
