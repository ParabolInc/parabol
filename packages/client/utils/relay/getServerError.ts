import type {PayloadError} from 'relay-runtime'

export type ServerError = PayloadError & {extensions?: Record<string, unknown>}

const getServerError = (error: Error): ServerError | undefined => {
  if (!('source' in error)) return undefined
  const {source} = error
  if (!source || typeof source !== 'object' || !('errors' in source)) return undefined
  return Array.isArray(source.errors) ? source.errors[0] : undefined
}

export default getServerError
