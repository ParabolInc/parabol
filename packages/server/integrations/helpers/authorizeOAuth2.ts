import fetch from 'node-fetch'
import {OAuth2Error, OAuth2Success} from '../../types/custom'

type OAuth2Response = OAuth2Success | OAuth2Error

interface AuthorizeOAuth2Params {
  authUrl: string
  searchParams?: Record<string, string>
  body?: Record<string, string>
  additonalHeaders?: Record<string, string>
}

export const authorizeOAuth2 = async <
  TSuccess = {accessToken: string; refreshToken: string | undefined; scopes: string | undefined}
>({
  authUrl,
  searchParams,
  body,
  additonalHeaders
}: AuthorizeOAuth2Params) => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...additonalHeaders
  }
  const url = new URL(authUrl)
  if (searchParams) {
    Object.entries(searchParams).forEach((entry) => {
      url.searchParams.append(...entry)
    })
  }

  const oauth2Response = await fetch(url, {
    method: 'POST',
    headers,
    body: body ? JSON.stringify(body) : undefined
  })
  const contentTypeHeader = oauth2Response.headers.get('content-type') || ''
  if (!contentTypeHeader.toLowerCase().startsWith('application/json')) {
    return new Error('Received non-JSON OAuth2 Response')
  }

  const tokenJson = (await oauth2Response.json()) as OAuth2Response
  if ('error' in tokenJson) return new Error(tokenJson.error)
  const {access_token: accessToken, refresh_token: oauthRefreshToken, scope} = tokenJson
  return {
    accessToken,
    refreshToken: oauthRefreshToken,
    scopes: scope
  } as unknown as TSuccess
}
