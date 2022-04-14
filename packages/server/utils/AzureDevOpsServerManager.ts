import fetch from 'node-fetch'
import AzureDevOpsManager from 'parabol-client/utils/AzureDevOpsManager'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../appOrigin'
import {authorizeOAuth2} from '../integrations/helpers/authorizeOAuth2'
import {
  OAuth2PkceAuthorizationParams,
  OAuth2PkceRefreshAuthorizationParams
} from '../integrations/OAuth2Manager'
import {IntegrationProviderAzureDevOps} from '../postgres/queries/getIntegrationProvidersByIds';
// import getIntegrationProvidersByIds, {IntegrationProviderAzureDevOps} from '../postgres/queries/getIntegrationProvidersByIds';
import {IGetTeamMemberIntegrationAuthQueryResult} from '../postgres/queries/generated/getTeamMemberIntegrationAuthQuery';
import {isError} from 'util';

class AzureDevOpsServerManager extends AzureDevOpsManager {
  fetch = fetch as any

  async init(code: string, codeVerifier: string | null) {
    if (!codeVerifier) {
      return {
        error: {message: 'Missing OAuth2 Verifier required for Azure DevOps authentication'}
      }
    }
    return this.fetchToken({
      grant_type: 'authorization_code',
      code: code,
      code_verifier: codeVerifier,
      redirect_uri: makeAppURL(appOrigin, 'auth/ado')
    })
  }
  // private readonly auth: IGetTeamMemberIntegrationAuthQueryResult
  private readonly provider: IntegrationProviderAzureDevOps
  // static provider: any;
  // private readonly serverBaseUrl: string
  // private readonly oauth: OAuth
  // private readonly token: OAuth.Token

  constructor(
    auth: IGetTeamMemberIntegrationAuthQueryResult | null,
    provider: IntegrationProviderAzureDevOps
  ) {
    super('')
    if (!!auth && !!auth.accessToken) {
      this.setToken(auth.accessToken)
    }
    // super(auth?.accessToken?)
    // super(auth?.accessToken ?? '')
    // super((!!auth?.accessToken) ? '' : auth.accessToken);
    // super(isNotNull(auth?.accessToken) ? auth.accessToken : '')
    // if (!!auth) {
    //   super(auth.accessToken?)
    // }
    // this.auth = auth
    this.provider = provider

    // const {serverBaseUrl, consumerKey, consumerSecret} = this.provider
    // const {accessToken, accessTokenSecret} = this.auth
    // super(accessToken)
    // this.serverBaseUrl = serverBaseUrl

    // this.token = {
    //   key: accessToken!,
    //   secret: accessTokenSecret!
    // }
  }

  // async init(code: string, codeVerifier: string) {
  //   return this.fetchToken({
  //     grant_type: 'authorization_code',
  //     code: code,
  //     code_verifier: codeVerifier,
  //     redirect_uri: makeAppURL(appOrigin, 'auth/ado')
  //   })
  // }

  async refresh(refreshToken: string) {
    return this.fetchToken({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      scope: '499b84ac-1321-427f-aa17-267ca6975798/.default',
      redirect_uri: 'http://localhost:8081/'
    })
  }

  private async fetchToken(
    params: OAuth2PkceAuthorizationParams | OAuth2PkceRefreshAuthorizationParams
  ) {
    const body = {
      ...params,
      client_id: this.provider.clientId
    }

    const additonalHeaders = {
      // eslint-disable-next-line prettier/prettier
      'Origin': 'http://localhost:8081'
    }
    const tenantId = this.provider.tenantId
    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`
    const contentType = 'application/x-www-form-urlencoded'
    const oAuthRes = await authorizeOAuth2({authUrl, body, additonalHeaders, contentType})
    if (!isError(oAuthRes)) {
      this.accessToken = oAuthRes.accessToken
    }
    return oAuthRes
  }

  // constructor(accessToken: string) {
  //   super(accessToken)
  // }
}

export default AzureDevOpsServerManager
