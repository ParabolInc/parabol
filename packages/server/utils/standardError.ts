import sendToSentry, {SentryOptions} from './sendToSentry'

const standardError = (error: Error, options: SentryOptions = {}) => {
  const {message} = error
  sendToSentry(error, options)
  return {error: {message}}
}

export default standardError
