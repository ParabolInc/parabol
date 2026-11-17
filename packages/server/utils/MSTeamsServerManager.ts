import postWebhook from './postWebhook'

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
    return postWebhook('MS Teams', this.webhookUrl, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: payload
    })
  }
}

export default MSTeamsServerManager
