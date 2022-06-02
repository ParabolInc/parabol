import fetch from 'node-fetch'
import {OAuth2Error, OAuth2Success} from '../../types/custom'

type OAuth2Response = OAuth2Success | OAuth2Error

interface AuthorizeOAuth2Params {
  authUrl: string
  searchParams?: Record<string, string>
  body?: Record<string, string>
  additonalHeaders?: Record<string, string>
  contentType?: string
}

const transformBody = (contentType: string, body?: Record<string, string>): string => {
  if (body === undefined) {
    return ''
  }

  if (contentType.toLowerCase().startsWith('application/json')) {
    return JSON.stringify(body)
  }

  if (contentType.toLowerCase().startsWith('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams()
    Object.entries(body).forEach((entry) => {
      params.append(entry[0], entry[1])
    })
    return params.toString()
  }

  return ''
}

export const authorizeOAuth2 = async <
  TSuccess = {
    accessToken: string
    refreshToken: string | undefined
    scopes: string | undefined
    expiresIn: number | undefined
  }
>({
  authUrl,
  searchParams,
  body,
  additonalHeaders,
  contentType
}: AuthorizeOAuth2Params) => {
  const headers = {
    Accept: 'application/json',
    ...additonalHeaders
  }
  if (typeof contentType !== 'undefined') {
    headers['Content-Type'] = contentType
  } else {
    headers['Content-Type'] = 'application/json'
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
    body: body ? transformBody(headers['Content-Type'], body) : undefined
  })
  const contentTypeHeader = oauth2Response.headers.get('content-type') || ''
  if (!contentTypeHeader.toLowerCase().startsWith('application/json')) {
    return new Error('Received non-JSON OAuth2 Response')
  }
  const tokenJson = (await oauth2Response.json()) as OAuth2Response
  if ('error' in tokenJson) {
    return new Error(tokenJson.error)
  }
  const {
    access_token: accessToken,
    refresh_token: oauthRefreshToken,
    scope,
    expires_in: expiresIn
  } = tokenJson
  return {
    accessToken,
    expiresIn,
    refreshToken: oauthRefreshToken,
    scopes: scope
  } as unknown as TSuccess
}
