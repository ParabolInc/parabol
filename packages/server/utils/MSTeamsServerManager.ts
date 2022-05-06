import fetch from 'node-fetch'

// MS Teams is a server-only integration for now, unlike the Slack integration

// We're following a similar manager pattern here should we wish to refactor the
// MS Teams integration.

const MAX_REQUEST_TIME = 5000

export interface MSTeamsApiResponse {
  ok: boolean
  status: number
  message?: string
  error?: string
}

abstract class MSTeamsManager {
  webhookUrl: string
  abstract fetch: typeof fetch
  headers: any

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  private fetchWithTimeout = async (url: string, options: RequestInit) => {
    const controller = new AbortController()
    const {signal} = controller
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME)
    try {
      const res = await this.fetch(url, {...options, signal} as any)
      clearTimeout(timeout)
      return res
    } catch (e) {
      clearTimeout(timeout)
      return new Error('MS Teams is not responding')
    }
  }

  async post(payload: any) {
    const res = await this.fetchWithTimeout(this.webhookUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json' as const,
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: payload
    })
    if (res instanceof Error) return res
    if (res.status !== 200) {
      if (res.headers.get('content-type') === 'application/json') {
        const {message: error} = await res.json()
        return new Error(`${res.status}: ${error}`)
      } else {
        return new Error(`${res.status}: ${res.statusText}`)
      }
    }
    return res
  }
}

class MSTeamsServerManager extends MSTeamsManager {
  fetch = fetch
  constructor(webhookUrl: string) {
    super(webhookUrl)
  }
}

export default MSTeamsServerManager
