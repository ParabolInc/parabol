import fetch from 'node-fetch'
import {URLSearchParams} from 'url'
import sendToSentry from '../../utils/sendToSentry'

const LINEAR_OAUTH2_URL = 'https://api.linear.app/oauth/token'

interface LinearTokenResponse {
  access_token: string
  token_type: string // e.g., Bearer
  expires_in: number // seconds
  refresh_token?: string
  scope: string // space-separated scopes granted
}

interface LinearOAuthResult {
  accessToken: string
  refreshToken: string | null
  expiresIn: number
  scope: string
  scopes: string // Add the missing 'scopes' property (likely same as 'scope')
}

class LinearOAuth2Manager {
  private clientId: string
  private clientSecret: string

  constructor() {
    this.clientId = process.env.LINEAR_CLIENT_ID || ''
    this.clientSecret = process.env.LINEAR_CLIENT_SECRET || ''

    if (!this.clientId || !this.clientSecret) {
      const errorMsg = 'LINEAR_CLIENT_ID or LINEAR_CLIENT_SECRET environment variables not set.'
      sendToSentry(new Error(errorMsg))
      // Depending on desired behavior, might throw here or let methods fail
      console.error(errorMsg)
    }
  }

  private async fetchTokens(params: URLSearchParams): Promise<LinearOAuthResult | Error> {
    if (!this.clientId || !this.clientSecret) {
      return new Error('Linear OAuth client credentials are not configured.')
    }
    try {
      const response = await fetch(LINEAR_OAUTH2_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      })

      if (!response.ok) {
        const errorBody = await response.text()
        const errorMsg = `Failed to fetch Linear tokens: ${response.status} ${response.statusText} - ${errorBody}`
        sendToSentry(new Error(errorMsg), {extras: {params: params.toString()}})
        return new Error(errorMsg)
      }

      const data = (await response.json()) as LinearTokenResponse

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token || null,
        expiresIn: data.expires_in,
        scope: data.scope,
        scopes: data.scope // Assign scope value to scopes property
      }
    } catch (error: any) {
      sendToSentry(error, {extras: {params: params.toString()}})
      return error
    }
  }

  async exchangeCode(code: string, redirectUri: string): Promise<LinearOAuthResult | Error> {
    const params = new URLSearchParams()
    params.append('grant_type', 'authorization_code')
    params.append('code', code)
    params.append('redirect_uri', redirectUri)
    params.append('client_id', this.clientId)
    params.append('client_secret', this.clientSecret)

    return this.fetchTokens(params)
  }

  async refresh(refreshToken: string): Promise<LinearOAuthResult | Error> {
    const params = new URLSearchParams()
    params.append('grant_type', 'refresh_token')
    params.append('refresh_token', refreshToken)
    params.append('client_id', this.clientId)
    params.append('client_secret', this.clientSecret)

    return this.fetchTokens(params)
  }
}

export default LinearOAuth2Manager
