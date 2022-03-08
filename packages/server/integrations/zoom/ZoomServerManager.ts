import {IntegrationProviderZoom} from '../../postgres/queries/getIntegrationProvidersByIds'

type CreateMeetingResult = {
  "uuid": string
  "id": number
  "host_email": string
  "topic": string
  "start_url": string
  "join_url": string
}

class ZoomServerManager {
  readonly provider: IntegrationProviderZoom
  readonly accessToken: string
  readonly serverBaseUrl: string

  constructor(accessToken: string, serverBaseUrl: string) {
    this.accessToken = accessToken
    this.serverBaseUrl = serverBaseUrl
  }

  async request(method: string, path: string, body: any) {
    const url = new URL(path, this.serverBaseUrl)
    const response = await fetch(url.toString(), {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    return response
  }

  async createMeeting(): Promise<CreateMeetingResult> {
    const meeting = {
      "default_password": true,
      "pre_schedule": false,
      "topic": "Parabol meeting",
      "type": 1
    }
    const response = await this.request('POST', '/v2/users/me/meetings', meeting)
    return response.json()
  }
}

export default ZoomServerManager
