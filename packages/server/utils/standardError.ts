import logError, {SentryOptions} from './logError'

const standardError = (error: Error, options: SentryOptions = {}) => {
  const {message} = error
  logError(error, options)
  return {error: {message}}
}

export default standardError
