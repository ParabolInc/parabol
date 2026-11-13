import {fetch} from '@whatwg-node/fetch'
import {Logger} from './Logger'

const MAX_ATTEMPTS = 4
const BASE_BACKOFF_MS = 500
const TRANSIENT_ERROR_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'EPIPE',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'UND_ERR_SOCKET'
])

interface FetchRetryingTransientErrorsOptions extends Omit<RequestInit, 'body'> {
  // a stream can only be sent once
  body?: Exclude<BodyInit, ReadableStream>
  logLabel: string
}

const isTransientStatus = (status: number) => status === 408 || status === 429 || status >= 500

const getErrorCode = (error: unknown): unknown => {
  if (!(error instanceof Error)) return undefined
  return 'code' in error ? error.code : getErrorCode(error.cause)
}

const isTransientErrorCode = (code: unknown): code is string =>
  typeof code === 'string' && TRANSIENT_ERROR_CODES.has(code)

export default async function fetchRetryingTransientErrors(
  url: string | URL,
  options: FetchRetryingTransientErrorsOptions
) {
  const {logLabel, ...init} = options
  for (let attempt = 1; ; attempt++) {
    const isLastAttempt = attempt === MAX_ATTEMPTS
    let failure: number | string
    try {
      const res = await fetch(url, init)
      if (isLastAttempt || !isTransientStatus(res.status)) return res
      await res.body?.cancel()
      failure = res.status
    } catch (e) {
      const errorCode = getErrorCode(e)
      if (isLastAttempt || !isTransientErrorCode(errorCode)) throw e
      failure = errorCode
    }
    Logger.warn(
      `${logLabel} failed with ${failure} on attempt ${attempt} of ${MAX_ATTEMPTS}, retrying`
    )
    const backoffMs = BASE_BACKOFF_MS * 2 ** (attempt - 1) + Math.random() * BASE_BACKOFF_MS
    await new Promise((resolve) => setTimeout(resolve, backoffMs))
  }
}
