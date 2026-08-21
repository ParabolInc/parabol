import AtlassianServerManager from '../../utils/AtlassianServerManager'
import {hasJiraScopes} from '../../utils/hasJiraScopes'
import {authorizeOAuth2} from '../helpers/authorizeOAuth2'
import OAuth2Manager, {
  type OAuth2AfterAuthorizePatch,
  type OAuth2AuthorizationParams,
  type OAuth2AuthorizeResponse,
  type OAuth2RefreshAuthorizationParams
} from '../OAuth2Manager'

export type JiraAuthMeta = {cloudIds: string[]}

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
  async authorize(code: string, redirectUri: string) {
    return this.fetchToken({grant_type: 'authorization_code', code, redirect_uri: redirectUri})
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

  async afterAuthorize(auth: OAuth2AuthorizeResponse): Promise<OAuth2AfterAuthorizePatch | Error> {
    const {accessToken, refreshToken, scopes} = auth
    const manager = new AtlassianServerManager(accessToken)
    const sites = await manager.getAccessibleResources()
    if (!Array.isArray(sites)) return new Error(`Jira: ${sites.message}`)
    const cloudIds = sites.map((site) => site.id)
    const cloudId = cloudIds[0]
    if (!cloudId) return new Error('Missing cloudId')
    // RFC 6749 §5.1: the token response may omit scope, so fall back to the granted
    // scopes each site reports — still IdP-derived, never a guess at what was requested
    const scopesToStore =
      scopes ??
      [
        ...new Set([
          ...sites.flatMap((site) => site.scopes),
          ...(refreshToken ? ['offline_access'] : [])
        ])
      ].join(' ')
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
    return {providerUserId: accountId, meta, scopes: scopesToStore}
  }
}
