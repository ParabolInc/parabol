import {MAX_REQUEST_TIME} from 'parabol-client/utils/constants'
import {postUntrusted} from './fetchUntrusted'
import {Logger} from './Logger'

// A team can save a URL that was never a webhook, or whose webhook was later deleted or revoked.
// Whatever its destination answers, or its silence, is a verdict on that URL, not a fault in Parabol
export class WebhookDestinationError extends Error {
  name = 'WebhookDestinationError'
}

const readErrorMessage = async (res: Response) => {
  if (res.headers.get('content-type') === 'application/json') {
    const body = await res.json().catch(() => null)
    if (typeof body?.message === 'string') return body.message
  }
  return res.statusText
}

const postWebhook = async (
  service: string,
  url: string,
  options: {headers: Record<string, string>; body: string}
) => {
  const res = await postUntrusted(url, {...options, signal: AbortSignal.timeout(MAX_REQUEST_TIME)})
  if (!res) return new WebhookDestinationError(`${service} webhook request failed`)
  if (!res.ok) return new WebhookDestinationError(`${res.status}: ${await readErrorMessage(res)}`)
  return res
}

const getHost = (url: string) => {
  try {
    return new URL(url).host
  } catch {
    return 'invalid URL'
  }
}

// Logs the host only, a webhook's path is its secret
export const logWebhookError = (
  error: Error,
  url: string,
  options: {userId: string; tags: Record<string, string>}
) => {
  const log = error instanceof WebhookDestinationError ? Logger.warn : Logger.error
  log(error, {...options, tags: {...options.tags, host: getHost(url)}})
}

export default postWebhook
