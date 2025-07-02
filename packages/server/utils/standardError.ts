import logError, {ErrorOptions} from './logError'

const standardError = (error: Error, options: ErrorOptions = {}) => {
  const {message} = error
  logError(error, options)
  return {error: {message}}
}

export default standardError
