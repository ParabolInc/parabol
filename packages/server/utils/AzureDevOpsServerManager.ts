import fetch from 'node-fetch'
import AzureDevOpsManager from 'parabol-client/utils/AzureDevOpsManager'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'
import {
  OAuth2AuthorizationParams,
  OAuth2RefreshAuthorizationParams,
  OAuth2PkceAuthorizationParams,
  OAuth2PkceRefreshAuthorizationParams
} from '../integrations/OAuth2Manager'

class AzureDevOpsServerManager extends AzureDevOpsManager {
  fetch = fetch as any

  static async init(code: string, codeVerifier: string) {
    return AzureDevOpsServerManager.fetchToken({
      grant_type: 'authorization_code',
      code: code,
      codeVerifier: codeVerifier,
      redirect_uri: makeAppURL(appOrigin, 'auth/ado')
    })
  }

  static async refresh(refreshToken: string) {
    return AzureDevOpsServerManager.fetchToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  }

  private static async fetchToken(
    params: OAuth2PkceAuthorizationParams | OAuth2RefreshAuthorizationParams
  ) {
    const body = {
      ...params,
      client_id: process.env.AZUREDEVOPS_CLIENT_ID!
    }
    const additonalHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    const authUrl = `https://login.microsoftonline.com/${process.env.AZUREDEVOPS_TENANT}/oauth2/v2.0/token`
    return authorizeOAuth2({authUrl, body, additonalHeaders})
  }
}
