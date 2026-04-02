import {MAX_REQUEST_TIME} from 'parabol-client/utils/constants'
import {postUntrusted} from './fetchUntrusted'
import logError from './logError'

// MS Teams is a server-only integration for now, unlike the Slack integration

// We're following a similar manager pattern here should we wish to refactor the
// MS Teams integration.

export interface MSTeamsApiResponse {
  ok: boolean
  status: number
  message?: string
  error?: string
}

class MSTeamsServerManager {
  webhookUrl: string
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async post(payload: string) {
    const res = await postUntrusted(this.webhookUrl, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: payload,
      signal: AbortSignal.timeout(MAX_REQUEST_TIME)
    })
    if (!res) {
      const error = new Error('MS Teams webhook request failed')
      logError(error)
      return error
    }
    if (res.status < 200 || res.status >= 300) {
      if (res.headers.get('content-type') === 'application/json') {
        const {message: error} = await res.json()
        return new Error(`${res.status}: ${error}`)
      }
      return new Error(`${res.status}: ${res.statusText}`)
    }
    return res
  }
}

export default MSTeamsServerManager
