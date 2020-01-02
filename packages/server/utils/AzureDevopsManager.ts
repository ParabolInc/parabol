import fetch from 'node-fetch'
import AzureDevopsClientManager from '../../client/utils/AzureDevopsClientManager'
import makeAppLink from './makeAppLink'

interface AuthBodyParams {
  grant_type: string
  code: string
  redirect_uri: string
}

interface OAuth2Response {
  access_token: string
  token_type: string
  expires_in: any
  refresh_token: string
  Error: string
  ErrorDescription: string
  scope: string
}

class AzureDevopsManager extends AzureDevopsClientManager {
  static async init(code: string) {
    return AzureDevopsManager.fetchToken({
      code,
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      // redirect_uri: makeAppLink('auth/azuredevops')
      redirect_uri: 'https://jdahost:3000/auth/azuredevops'
    })
  }

  static async refresh(refreshToken: string) {
    return AzureDevopsManager.fetchToken({
      code: refreshToken,
      grant_type: 'refresh_token',
      // redirect_uri: makeAppLink('auth/azuredevops')
      redirect_uri: 'https://jdahost:3000/auth/azuredevops'
    })
  }

  static async fetchToken(partialBodyParams: AuthBodyParams) {
    const bodyParams = {
      ...partialBodyParams,
      client_id: process.env.AZUREDEVOPS_CLIENT_ID,
      client_secret: process.env.AZUREDEVOPS_CLIENT_SECRET
    }

    const uri = `https://app.vssps.visualstudio.com/oauth2/token`

    const tokenRes = await fetch(uri, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer&client_assertion=${bodyParams.client_secret}&grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${bodyParams.code}&redirect_uri=${bodyParams.redirect_uri}`
    })

    const tokenJson = (await tokenRes.json()) as OAuth2Response
    const {
      access_token: accessToken,
      refresh_token: refreshToken,
      Error: error,
      ErrorDescription: errorDescription,
      scope
    } = tokenJson

    if (error) {
      throw new Error(`AzureDevops: ${error}, ${errorDescription},`)
    }
    const providedScope = scope.split(' ')
    const matchingScope =
      new Set([...AzureDevopsManager.SCOPE.split(' '), ...providedScope]).size ===
      providedScope.length
    if (!matchingScope) {
      throw new Error(`bad scope: ${scope}`)
    }

    return new AzureDevopsManager(accessToken, refreshToken)
  }

  constructor(accessToken: string, refreshToken?: string) {
    super(accessToken, {fetch, refreshToken})
  }
}

export default AzureDevopsManager
