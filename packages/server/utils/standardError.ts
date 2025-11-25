import {Logger} from './Logger'
import {type ErrorOptions} from './logError'

const standardError = (error: Error, options: ErrorOptions = {}) => {
  const {message} = error
  Logger.info(error || JSON.stringify(error), options)
  return {error: {message}}
}

export default standardError
