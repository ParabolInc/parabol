import type {DB as OriginalDB, Organization as OriginalOrganization} from '../postgres/types/pg'

export interface OAuthCodeTable {
  id: string
  clientId: string
  redirectUri: string
  userId: string
  scopes: string[]
  expiresAt: number
  createdAt: number
}

export interface Organization extends OriginalOrganization {
  oauthClientId: string | null
  oauthClientSecret: string | null
  oauthRedirectUris: string[] | null
  oauthScopes: string[] | null
}

export interface DB extends Omit<OriginalDB, 'Organization'> {
  Organization: Organization
  OAuthCode: OAuthCodeTable
}
