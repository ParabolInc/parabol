import {MAX_REQUEST_TIME} from 'parabol-client/utils/constants'
import {postUntrusted} from './fetchUntrusted'

// Mattermost is a server-only integration for now, unlike the Slack integration

// We're following a similar manager pattern here should we wish to refactor the
// Mattermost integration. We might want to do this if we decide to use Mattermost's
// upcoming "App" framework

export interface MattermostApiResponse {
  ok: boolean
  status: number
  message?: string
  error?: string
}

class MattermostServerManager {
  webhookUrl: string
  webhookToken?: string

  constructor(webhookUrl: string, webhookToken?: string) {
    this.webhookUrl = webhookUrl
    this.webhookToken = webhookToken
  }

  // See: https://developers.mattermost.com/integrate/incoming-webhooks/

  private async post(payload: any) {
    const url = this.webhookUrl
    const body = JSON.stringify(payload)
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }

    if (this.webhookToken) {
      headers['Authorization'] = `Bearer ${this.webhookToken}`
    }

    const res = await postUntrusted(url, {
      headers,
      body,
      signal: AbortSignal.timeout(MAX_REQUEST_TIME)
    })
    if (!res) {
      return new Error('Mattermost webhook request failed')
    }
    if (res.status !== 200) {
      if (res.headers.get('content-type') === 'application/json') {
        const {message: error} = await res.json()
        return new Error(`${res.status}: ${error}`)
      }
      return new Error(`${res.status}: ${res.statusText}`)
    }
    return res
  }

  async postMessage(textOrAttachmentsArray: string | unknown[], notificationText?: string) {
    const prop =
      typeof textOrAttachmentsArray === 'string'
        ? 'text'
        : Array.isArray(textOrAttachmentsArray)
          ? 'attachments'
          : null
    if (!prop) return new Error('Invalid mattermost message')
    const defaultPayload = {
      [prop]: textOrAttachmentsArray
    }
    const payload =
      prop === 'text'
        ? defaultPayload
        : {
            ...defaultPayload,
            text: notificationText
          }

    return await this.post(payload)
  }
}

export default MattermostServerManager
