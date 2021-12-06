export interface OAuth2Success {
  access_token: string
  token_type: string
  expires_in?: number
  refresh_token?: string
  scope?: string
}

export interface OAuth2Error {
  error:
    | 'invalid_request'
    | 'invalid_client'
    | 'invalid_grant'
    | 'invalid_scope'
    | 'unauthorized_client'
    | 'unsupported_grant_type'
  error_description?: string
  error_uri?: string
}
