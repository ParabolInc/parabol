import fetch from 'node-fetch'
import {DataLoaderWorker} from '../graphql/graphql'

// Mattermost is a server-only integration for now, unlike the Slack integration

// We're following a similar manager pattern here should we wish to refactor the
// Mattermost integration. We might want to do this if we decide to use Mattermost's
// upcoming "App" framework

const MAX_REQUEST_TIME = 5000

export interface MattermostApiResponse {
  ok: boolean
  status: number
  message?: string
  error?: string
}

abstract class MattermostManager {
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
      return new Error('Mattermost is not responding')
    }
  }

  // See: https://developers.mattermost.com/integrate/incoming-webhooks/

  private async post(payload: any) {
    const res = await this.fetchWithTimeout(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(payload)
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
  constructor(webhookUrl: string) {
    super(webhookUrl)
  }

  static async getBestWebhook(userId: string, teamId: string, dataLoader: DataLoaderWorker) {
    const tokensAndProvider = await dataLoader
      .get('integrationTokensByTeamWithProvider')
      .load({provider: 'mattermost', teamId})
    if (!tokensAndProvider) {
      console.warn('No Mattermost integration tokens found for team', teamId)
      return null
    }

    const bestTokenAndProvider = tokensAndProvider.sort((a, b) => {
      const userIdCompare = (b.userId != userId ? 0 : 1) - (a.userId != userId ? 0 : 1)
      if (userIdCompare != 0) return userIdCompare
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })[0]

    const {
      provider: {providerMetadata}
    } = bestTokenAndProvider

    //TODO: make it nicer when mattermost is aligned to new patterns
    return (providerMetadata as any).webhookUrl
  }
}

export default MattermostServerManager
