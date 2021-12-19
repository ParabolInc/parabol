import {stringify} from 'querystring'
import fetch from 'node-fetch'

import {OAuth2Response} from '../IntegrationServerManager'
import {OAuth2IntegrationTokenMetadata} from '../../postgres/types/IntegrationToken'

type AuthorizeOAuth2Params = {
  authUrl: string
  queryParams?: Record<string, string>
  body?: Record<string, string>
  additonalHeaders?: Record<string, string>
}

export const authorizeOAuth2 = async ({
  authUrl,
  queryParams,
  body,
  additonalHeaders
}: AuthorizeOAuth2Params): Promise<OAuth2IntegrationTokenMetadata | Error> => {
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...additonalHeaders
  }

  let uri = `${authUrl}`
  if (queryParams) {
    uri = uri.concat(`?${stringify(queryParams)}`)
  }
  const oauth2Response = await fetch(uri, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })
  const tokenJson = (await oauth2Response.json()) as Required<OAuth2Response>
  console.log('OAuth2Response', tokenJson)

  if ('error' in tokenJson) return new Error(tokenJson.error)
  const {access_token: accessToken, refresh_token: oauthRefreshToken, scope} = tokenJson
  return {
    accessToken,
    refreshToken: oauthRefreshToken,
    scopes: scope.split(',')
  }
}
