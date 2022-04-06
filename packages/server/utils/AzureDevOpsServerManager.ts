import fetch from 'node-fetch'
import AzureDevOpsManager from 'parabol-client/utils/AzureDevOpsManager'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'
import {
  OAuth2PkceAuthorizationParams,
  OAuth2PkceRefreshAuthorizationParams
} from '../integrations/OAuth2Manager'

class AzureDevOpsServerManager extends AzureDevOpsManager {
  fetch = fetch as any

  static async init(code: string, codeVerifier: string) {
    return AzureDevOpsServerManager.fetchToken({
      grant_type: 'authorization_code',
      code: code,
      code_verifier: codeVerifier,
      redirect_uri: makeAppURL(appOrigin, 'auth/ado')
    })
  }

  static async refresh(refreshToken: string, tokenSecret: string) {
    console.log(`tokenSecret: ${tokenSecret}`)
    return AzureDevOpsServerManager.fetchToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: '499b84ac-1321-427f-aa17-267ca6975798/.default',
      redirect_uri: 'http://localhost:8081/',
      client_secret: tokenSecret
    })
  }

  private static async fetchToken(
    params: OAuth2PkceAuthorizationParams | OAuth2PkceRefreshAuthorizationParams
  ) {
    const body = {
      ...params,
      client_id: process.env.AZUREDEVOPS_CLIENT_ID!
    }
    const additonalHeaders = {
      // eslint-disable-next-line prettier/prettier
      'Origin': 'http://localhost:8081'
    }
    const authUrl = `https://login.microsoftonline.com/${process.env.AZUREDEVOPS_TENANT}/oauth2/v2.0/token`
    const contentType = 'application/x-www-form-urlencoded'
    return authorizeOAuth2({authUrl, body, additonalHeaders, contentType})
  }

  constructor(accessToken: string) {
    super(accessToken)
  }
}

export default AzureDevOpsServerManager
