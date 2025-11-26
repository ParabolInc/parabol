import type {DB as OriginalDB, Organization as OriginalOrganization} from '../postgres/types/pg'

export interface OAuthAPICodeTable {
  id: string
  clientId: string
  redirectUri: string
  userId: string
  scopes: string[]
  expiresAt: number
  createdAt: number
}

export interface OAuthAPIProviderTable {
  id: string
  organizationId: string
  name: string
  clientId: string
  clientSecret: string
  redirectUris: string[]
  scopes: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Organization extends OriginalOrganization {
  // Removed OAuth fields
}

export interface DB extends Omit<OriginalDB, 'Organization'> {
  Organization: Organization
  OAuthAPICode: OAuthAPICodeTable
  OAuthAPIProvider: OAuthAPIProviderTable
}
