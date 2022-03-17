import fetch from 'node-fetch'
import AzureDevOpsManager from 'parabol-client/utils/AzureDevOpsManager'
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

  private static async fetchToken(params: OAuth2PkceAuthorizationParams) {
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
