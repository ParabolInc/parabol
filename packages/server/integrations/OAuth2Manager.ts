export interface OAuth2AuthorizationParams {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
}

export interface OAuth2PkceAuthorizationParams extends OAuth2AuthorizationParams {
  code_verifier: string
}

//export interface OAuth2PkceRefreshAuthorizationParams extends OAuth2RefreshAuthorizationParams {}

export interface OAuth2RefreshAuthorizationParams {
  grant_type: 'refresh_token'
  refresh_token: string
}

export interface OAuth2PkceRefreshAuthorizationParams extends OAuth2RefreshAuthorizationParams {
  scope: string
  redirect_uri: string
  //client_secret: string
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
  abstract authorize(
    code: string,
    redirectUri: string
  ): Promise<Error | {accessToken: string; refreshToken: string; scopes: string}>

  abstract refresh(refreshToken: string): Promise<Error | {accessToken: string}>
  protected abstract fetchToken(
    partialAuthParams: OAuth2RefreshAuthorizationParams | OAuth2AuthorizationParams
  ): Promise<
    {accessToken: string; refreshToken: string | undefined; scopes: string | undefined} | Error
  >
}
