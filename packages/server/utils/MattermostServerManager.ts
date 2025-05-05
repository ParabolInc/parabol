import {fetch} from '@whatwg-node/fetch'
import {createSigner, httpbis} from 'http-message-signatures'
import {MAX_REQUEST_TIME} from 'parabol-client/utils/constants'
import sendToSentry from './sendToSentry'

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

abstract class MattermostManager {
  webhookUrl: string
  secret?: string
  abstract fetch: typeof fetch
  headers: any

  constructor(webhookUrl: string, secret?: string) {
    this.webhookUrl = webhookUrl
    this.secret = secret
  }

  // See: https://developers.mattermost.com/integrate/incoming-webhooks/

  private async post(payload: any) {
    const url = this.webhookUrl
    const method = 'POST'
    const body = JSON.stringify(payload)
    const digestArray = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))
    const digest = Array.from(new Uint8Array(digestArray))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Content-Digest': 'SHA-256=' + digest
    } as Record<string, string>

    if (this.secret) {
      const key = createSigner(this.secret, 'hmac-sha256', 'foo')
      const signedRequest = await httpbis.signMessage(
        {
          key,
          name: 'parabol',
          fields: ['@request-target', 'content-digest']
        },
        {
          method,
          url,
          headers,
          body
        }
      )
      headers['Signature'] = signedRequest.headers['Signature']!
      headers['Signature-Input'] = signedRequest.headers['Signature-Input']!
    }
    try {
      const res = await this.fetch(url, {
        method,
        headers,
        body,
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
      return new Error('Mattermost is not responding')
    }
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

class MattermostServerManager extends MattermostManager {
  fetch = fetch
  constructor(webhookUrl: string, secret?: string) {
    super(webhookUrl, secret)
  }
}

export default MattermostServerManager
