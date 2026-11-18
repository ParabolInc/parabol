import type {Result} from 'relay-runtime'

const readExtensionsMessage = (error: unknown) => {
  if (typeof error !== 'object' || error === null || !('extensions' in error)) return undefined
  const {extensions} = error
  if (typeof extensions !== 'object' || extensions === null || !('message' in extensions)) {
    return undefined
  }
  return typeof extensions.message === 'string' ? extensions.message : undefined
}

// Atmosphere copies each server error's message into its extensions, the part of the error @catch keeps
const getCaughtErrorMessage = (result: Result<unknown, unknown> | null | undefined) => {
  if (!result || result.ok) return undefined
  return readExtensionsMessage(result.errors[0]) ?? 'Something went wrong'
}

export default getCaughtErrorMessage
