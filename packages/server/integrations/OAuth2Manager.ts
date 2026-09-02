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
  /** The user's id on the provider, when the service exposes one */
  providerUserId?: string | null
  /** Service-specific bolt-ons stored on the auth row, e.g. jira: {cloudIds} */
  meta?: JsonObject
}

export type OAuth2RefreshResponse = {
  accessToken: string
  refreshToken?: string | null
  scopes?: string
  expiresIn?: number
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
  abstract authorize(code: string): Promise<Error | OAuth2AuthorizeResponse>
  abstract refresh(refreshToken: string): Promise<Error | OAuth2RefreshResponse>
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
