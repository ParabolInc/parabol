import {fetch} from '@whatwg-node/fetch'
import {Logger} from './Logger'

interface FetchWithRetryOptions extends RequestInit {
  deadline: Date // Deadline for all attempts combined
  debug?: boolean // Enable debug tracing
  retryStatusCodes?: number[] // Status codes that trigger a retry
}

export default async function fetchWithRetry(
  url: RequestInfo,
  options: FetchWithRetryOptions
): Promise<Response> {
  const {deadline, debug = false, retryStatusCodes = [429], ...fetchOptions} = options
  let attempt = 0

  if (Date.now() >= deadline.getTime()) {
    throw new Error('Deadline has already passed')
  }

  while (Date.now() < deadline.getTime()) {
    attempt++
    // Recompute remaining time on every attempt so the signal is fresh
    const remainingMs = deadline.getTime() - Date.now()

    if (debug) {
      Logger.log(`Attempt ${attempt}: Fetching ${JSON.stringify(url)}`)
    }

    let response: Response
    try {
      response = await fetch(url, {
        ...fetchOptions,
        signal: AbortSignal.timeout(remainingMs)
      })
    } catch (error) {
      const isAbort =
        error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')
      if (isAbort || Date.now() >= deadline.getTime()) {
        throw new Error('Request aborted: deadline exceeded')
      }
      if (debug) {
        Logger.warn(`Attempt ${attempt} failed with error: ${error}`)
      }
      throw error
    }

    if (!retryStatusCodes.includes(response.status)) {
      return response
    }

    // Drain the body so the socket is released back to the pool
    await response.body?.cancel()

    const retryAfterHeader = response.headers.get('Retry-After')
    const retryAfterMs = retryAfterHeader !== null ? parseInt(retryAfterHeader, 10) * 1000 : NaN
    const backoffMs = Number.isFinite(retryAfterMs) ? retryAfterMs : 2 ** attempt * 1000

    // Never wait past the deadline
    const waitMs = Math.min(backoffMs, deadline.getTime() - Date.now())

    if (waitMs <= 0) {
      break
    }

    if (debug) {
      Logger.log(`Attempt ${attempt} got ${response.status}. Retrying in ${waitMs / 1000}s...`)
    }

    await new Promise<void>((resolve) => setTimeout(resolve, waitMs))
  }

  throw new Error('Deadline exceeded before a successful response')
}
