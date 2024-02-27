import fetch, {RequestInfo, RequestInit, Response} from 'node-fetch'

interface FetchWithRetryOptions extends RequestInit {
  deadline: Date // Deadline for the request to complete
  debug?: boolean // Enable debug tracing
  retryStatusCodes?: number[] // Array of status codes to retry on
}

export default async (url: RequestInfo, options: FetchWithRetryOptions): Promise<Response> => {
  const {deadline, debug = false, retryStatusCodes = [429], ...fetchOptions} = options
  let attempt = 0
  const controller = new AbortController()
  fetchOptions.signal = controller.signal

  const timeout = deadline.getTime() - Date.now()
  if (timeout <= 0) {
    throw new Error('Deadline has already passed')
  }

  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    while (true) {
      attempt++
      if (debug) {
        console.log(`Attempt ${attempt}: Fetching ${url}`)
      }

      const response = await fetch(url, fetchOptions)

      if (!retryStatusCodes.includes(response.status)) {
        clearTimeout(timeoutId)
        return response
      }

      const retryAfter = response.headers.get('Retry-After')
      // if Retry-After specified, use it; else fallback to exponential backoff
      let waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, attempt) * 1000

      if (debug) {
        console.log(
          `Waiting ${waitTime / 1000} seconds before retrying due to status ${response.status}...`
        )
      }
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('Request aborted due to deadline')
    }
    if (debug) {
      console.error(`Attempt ${attempt} failed: ${error}`)
    }
    const currentTime = Date.now()
    if (currentTime >= deadline.getTime()) {
      throw new Error('Deadline exceeded before a successful request')
    }
    throw error // Re-throw the error if it's not related to deadline exceeding
  }
}
