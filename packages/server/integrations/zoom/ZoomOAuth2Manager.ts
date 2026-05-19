import {fetch} from '@whatwg-node/fetch'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2RefreshAuthorizationParams
} from '../OAuth2Manager'

export default class ZoomOAuth2Manager extends OAuth2Manager {
  async authorize(code: string, redirectUri: string) {
    return this.fetchToken<{
      accessToken: string
      refreshToken: string
      scopes: string
      expiresIn: number
    }>({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri
    })
  }

  async refresh(refreshToken: string) {
    return this.fetchToken<{
      accessToken: string
      refreshToken: string
      scopes: string
      expiresIn: number
    }>({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

  // Zoom requires Basic auth (clientId:clientSecret) instead of body params
  protected async fetchToken<TSuccess>(
    partialAuthParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ) {
    const authUrl = 'https://zoom.us/oauth/token'
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
    const params = new URLSearchParams()
    Object.entries(partialAuthParams).forEach(([k, v]) => params.append(k, v))

    const res = await fetch(`${authUrl}?${params.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    if (!res.ok) {
      const text = await res.text()
      return new Error(`Zoom OAuth error: ${text}`)
    }
    const json = (await res.json()) as Record<string, unknown>
    if ('error' in json) return new Error(String(json.error_description ?? json.error))
    const {access_token, refresh_token, scope, expires_in} = json as {
      access_token: string
      refresh_token: string
      scope: string
      expires_in: number
    }
    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      scopes: scope,
      expiresIn: expires_in
    } as TSuccess
  }

  async getProviderUserId(accessToken: string): Promise<string | null> {
    const res = await fetch('https://api.zoom.us/v2/users/me', {
      headers: {Authorization: `Bearer ${accessToken}`}
    })
    if (!res.ok) return null
    const data = (await res.json()) as {id?: string}
    return data.id ?? null
  }
}
