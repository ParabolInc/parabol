import type {JiraAuthMeta} from '../../postgres/types'
import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {hasJiraScopes} from '../../utils/hasJiraScopes'
import {makeOAuth2Redirect} from '../../utils/makeOAuth2Redirect'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  type OAuth2AuthorizationParams,
  type OAuth2AuthorizeResponse,
  type OAuth2RefreshAuthorizationParams
} from '../OAuth2Manager'

const accountIdFromJwt = (accessToken: string): string | Error => {
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split('.')[1]!, 'base64url').toString('utf8')
    )
    const sub = typeof payload.sub === 'string' ? payload.sub : ''
    return sub || new Error('Atlassian: token missing account id')
  } catch {
    return new Error('Atlassian: could not read account id from token')
  }
}

export default class JiraOAuth2Manager extends OAuth2Manager {
  // unlike its siblings this honors OAUTH2_REDIRECT (PPMI worker); the client reads the same value as __ACTION__.oauth2Redirect
  static readonly REDIRECT_URI = makeOAuth2Redirect()

  async authorize(code: string) {
    const auth = await this.fetchToken({
      grant_type: 'authorization_code',
      code,
      redirect_uri: JiraOAuth2Manager.REDIRECT_URI
    })
    if (auth instanceof Error) return auth
    const {accessToken, refreshToken, scopes} = auth
    // Atlassian only returns a refresh token when offline_access is granted; without one the
    // access token dies in an hour and the row would read as Connected while every call fails
    if (!refreshToken) return new Error('Atlassian did not grant offline access')
    const manager = new AtlassianServerManager(accessToken)
    const sites = await manager.getAccessibleResources()
    if (!Array.isArray(sites)) return new Error(`Jira: ${sites.message}`)
    const cloudIds = sites.map((site) => site.id)
    const cloudId = cloudIds[0]
    if (!cloudId) return new Error('Missing cloudId')
    // RFC 6749 §5.1: the token response may omit scope, so fall back to the granted
    // scopes each site reports — still IdP-derived, never a guess at what was requested
    const scopesToStore =
      scopes ?? [...new Set([...sites.flatMap((site) => site.scopes), 'offline_access'])].join(' ')
    // getMyself is a Jira API call — a Confluence-only grant 401s on it. The account id
    // is also the sub claim of the OAuth access token (a JWT), which needs no scopes.
    const accountId = hasJiraScopes(scopesToStore)
      ? await manager
          .getMyself(cloudId)
          .then((self) =>
            'accountId' in self ? self.accountId : new Error(`Jira: ${self.message}`)
          )
      : accountIdFromJwt(accessToken)
    if (accountId instanceof Error) return accountId
    const meta: JiraAuthMeta = {cloudIds}
    return {...auth, scopes: scopesToStore, providerUserId: accountId, meta}
  }

  async refresh(refreshToken: string) {
    return this.fetchToken({grant_type: 'refresh_token', refresh_token: refreshToken})
  }

  protected async fetchToken(
    partialAuthParams: OAuth2AuthorizationParams | OAuth2RefreshAuthorizationParams
  ) {
    const body = {...partialAuthParams, client_id: this.clientId, client_secret: this.clientSecret}
    return authorizeOAuth2<OAuth2AuthorizeResponse>({
      authUrl: 'https://auth.atlassian.com/oauth/token',
      body
    })
  }
}
