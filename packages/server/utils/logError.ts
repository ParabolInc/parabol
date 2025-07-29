import {Logger} from './Logger'

export interface ErrorOptions {
  userId?: string
  ip?: string
  tags?: {
    [tag: string]: string | number
  }
  extras?: Record<string, unknown>
}

// Even though this is a promise we'll never need to await it, so we'll never need to worry about catching an error
const logError = async (error: Error, options: ErrorOptions = {}) => {
  const {tags, extras, userId, ip} = options
  Logger.error(error || JSON.stringify(error), {tags, extras, userId, ip})
}

export default logError
