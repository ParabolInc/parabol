import {HttpResponse} from 'uWebSockets.js'
import {Socket} from './Socket'
import {createSigner, httpbis} from 'http-message-signatures'

export type TransportType = HttpResponse

const MATTERMOST_URL = process.env.MATTERMOST_URL && new URL(process.env.MATTERMOST_URL)
const MATTERMOST_SECRET = process.env.MATTERMOST_SECRET
const MAX_REQUEST_TIME = 5000

export class MMSocket implements Socket {
  prefix = 'mm'

  isDone = false
  url = `http://${MATTERMOST_URL!.toString()}/plugins/co.parabol.action/graphqlWebhook`
  secret = MATTERMOST_SECRET!
  connectionId: string

  constructor(connectionId: string) {
    this.connectionId = connectionId
  }

  done() {
    return this.isDone
  }

  sendEncodedMessage(payload: string) {
    if (this.done()) return
    this.signedFetch(JSON.stringify({connectionId: this.connectionId, payload}))
  }

  keepAlive() {
    //sendSSEMessage(this.transport, 'ka', 'ka')
  }

  closeTransport(_code?: number, _reason?: string) {
    this.isDone = true
  }

  signedFetch = async (body: string) => {
    const method = 'POST'
    const digestArray = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body))
    const digest = Array.from(new Uint8Array(digestArray))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Content-Digest': 'SHA-256=' + digest
    } as Record<string, string>


    const key = createSigner(this.secret, 'hmac-sha256', 'foo')
    const signedRequest = await httpbis.signMessage(
      {
        key,
        name: 'parabol',
        fields: ['@request-target', 'content-digest']
      },
      {
        method,
        url: this.url,
        headers,
        body
      }
    )
    headers['Signature'] = signedRequest.headers['Signature']!
    headers['Signature-Input'] = signedRequest.headers['Signature-Input']!

    const res = await this.fetchWithTimeout(this.url, {
      method,
      headers,
      body
    })
    if (res instanceof Error || res.status !== 200) {
      this.isDone = true
    }
  }

  private fetchWithTimeout = async (url: string, options: RequestInit) => {
    const controller = new AbortController()
    const {signal} = controller
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME)
    try {
      const res = await fetch(url, {...options, signal} as any)
      clearTimeout(timeout)
      return res
    } catch (e) {
      clearTimeout(timeout)
      return new Error('MMSocket: Mattermost is not responding')
    }
  }


}
