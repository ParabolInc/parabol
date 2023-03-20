import {GoogleErrorResponse} from '../../../GoogleLanguageManager'
import sendToSentry from '../../../utils/sendToSentry'

const manageGoogleNLPErrorResponse = <T>(res: T) => {
  if (Array.isArray(res)) {
    const [firstError] = res
    if (firstError) {
      const {error} = firstError
      if (error) {
        const {message} = error
        if (message !== 'No JWT provided') {
          const re = /language \S+ is not supported/
          if (!re.test(message)) {
            sendToSentry(new Error(`Grouping Error: Google NLP: ${message}`))
          }
        }
      }
    }
    return null
  }
  return res as T extends GoogleErrorResponse ? never : T
}

export default manageGoogleNLPErrorResponse
