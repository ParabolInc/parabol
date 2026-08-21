import type {JsonObject} from '../postgres/types/pg'
export interface OAuth2AuthorizationParams {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
}

export interface OAuth2PkceAuthorizationParams extends OAuth2AuthorizationParams {
  code_verifier: string
}

export interface OAuth2RefreshAuthorizationParams {
  grant_type: 'refresh_token'
  refresh_token: string
}

export interface OAuth2PkceRefreshAuthorizationParams extends OAuth2RefreshAuthorizationParams {
  scope: string
  redirect_uri: string
}

export type OAuth2AuthorizeResponse = {
  accessToken: string
  refreshToken: string | undefined
  scopes: string
  expiresIn?: number
}

export type OAuth2AfterAuthorizePatch = {
  providerUserId?: string | null
  meta?: JsonObject
  scopes?: string
}

export default abstract class OAuth2Manager {
  protected clientId: string
  protected clientSecret: string
  protected serverBaseUrl: string
  constructor(clientId: string, clientSecret: string, serverBaseUrl: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.serverBaseUrl = serverBaseUrl
  }
  abstract authorize(code: string, redirectUri: string): Promise<Error | OAuth2AuthorizeResponse>

  /** Service-specific data fetched with the fresh token (account id, site list…). Stored generically on the auth row. */
  async afterAuthorize(_auth: OAuth2AuthorizeResponse): Promise<OAuth2AfterAuthorizePatch | Error> {
    return {}
  }

  abstract refresh(refreshToken: string): Promise<Error | {accessToken: string}>
  protected abstract fetchToken(
    partialAuthParams: OAuth2RefreshAuthorizationParams | OAuth2AuthorizationParams
  ): Promise<
    | {
        accessToken: string
        refreshToken: string | undefined
        scopes: string | undefined
      }
    | Error
  >
}
