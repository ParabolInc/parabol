import sendToSentry, {SentryOptions} from './sendToSentry'

const standardError = (err: Error | unknown, options: SentryOptions = {}) => {
  const error = err instanceof Error ? err : new Error(JSON.stringify(err))
  const {message} = error
  sendToSentry(error, options)
  return {error: {message}}
}

export default standardError
