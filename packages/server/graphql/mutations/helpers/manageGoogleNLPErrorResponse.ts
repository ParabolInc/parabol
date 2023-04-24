import {GoogleErrorResponse, GoogleLanguageResponse} from '../../../GoogleLanguageManager'
import sendToSentry from '../../../utils/sendToSentry'

const manageGoogleNLPErrorResponse = <T extends GoogleLanguageResponse | GoogleErrorResponse>(
  res: T
) => {
  if ('error' in res) {
    const {message} = res.error
    if (message !== 'No JWT provided') {
      const re = /language \S+ is not supported/
      if (!re.test(message)) {
        sendToSentry(new Error(`Unhandled error from Google NLP: ${message}`))
      }
    }
    return null
  }
  return res as T extends GoogleErrorResponse ? never : T
}

export default manageGoogleNLPErrorResponse
