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

export default abstract class OAuth2Manager {
  protected clientId: string
  protected clientSecret: string
  protected serverBaseUrl: string
  constructor(clientId: string, clientSecret: string, serverBaseUrl: string) {
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.serverBaseUrl = serverBaseUrl
  }
  /** redirectUri is null when the client relies on the app callback registered with the provider (GitHub) */
  abstract authorize(
    code: string,
    redirectUri: string | null
  ): Promise<Error | OAuth2AuthorizeResponse>
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
