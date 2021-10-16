import fetch from 'node-fetch'

// Mattermost is a server-only integration for now, unlike the Slack integration

// We're following a similar manager pattern here should we wish to refactor the
// Mattermost integration. We might want to do this if we decide to use Mattermost's
// upcoming "App" framework

abstract class MattermostManager {
  webhookUrl: string
  abstract fetch
  headers: any

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl
  }

  private async post(payload: any): Promise<number> {
    const res = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json' as const,
        Accept: 'application/json' as const
      },
      body: JSON.stringify(payload)
    })
    return res.status
  }

  async postMessage(textOrAttachmentsArray: string | Array<object>, notificationText?: string) {
    const prop =
      typeof textOrAttachmentsArray === 'string'
        ? 'text'
        : Array.isArray(textOrAttachmentsArray)
        ? 'attachments'
        : null
    if (!prop) throw new Error('Invalid matterMost message')
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
}

export default MattermostServerManager
