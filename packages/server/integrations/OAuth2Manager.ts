import {IIntegrationProviderMetadataInputOAuth2} from '../graphql/types/IntegrationProviderMetadataInputOAuth2'

export interface OAuth2AuthorizationParams {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
}

export interface OAuth2RefreshAuthorizationParams {
  grant_type: 'refresh_token'
  refresh_token: string
}

export default abstract class OAuth2Manager {
  protected metadata: IIntegrationProviderMetadataInputOAuth2
  constructor(providerMetadata: IIntegrationProviderMetadataInputOAuth2) {
    this.metadata = providerMetadata
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
