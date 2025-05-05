import {fetch} from '@whatwg-node/fetch'
import {MAX_REQUEST_TIME} from 'parabol-client/utils/constants'
import sendToSentry from './sendToSentry'

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
  headers: any
  fetch = fetch
  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  async post(payload: any) {
    try {
      const res = await this.fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json' as const,
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: payload,
        signal: AbortSignal.timeout(MAX_REQUEST_TIME)
      })
      if (res.status !== 200) {
        if (res.headers.get('content-type') === 'application/json') {
          const {message: error} = await res.json()
          return new Error(`${res.status}: ${error}`)
        } else {
          return new Error(`${res.status}: ${res.statusText}`)
        }
      }
      return res
    } catch (error) {
      if (error instanceof Error) {
        sendToSentry(error)
        return error
      }
      return new Error('MS Teams is not responding')
    }
  }
}

export default MSTeamsServerManager
