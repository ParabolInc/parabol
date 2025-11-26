import generateUID from '../../generateUID'

interface Input {
  id?: string
  organizationId: string
  name: string
  clientId: string
  clientSecret: string
  redirectUris: string[]
  scopes: string[]
  createdAt?: Date
  updatedAt?: Date
}

export default class OAuthAPIProvider {
  id: string
  organizationId: string
  name: string
  clientId: string
  clientSecret: string
  redirectUris: string[]
  scopes: string[]
  createdAt: Date
  updatedAt: Date

  constructor(input: Input) {
    const {
      id,
      organizationId,
      name,
      clientId,
      clientSecret,
      redirectUris,
      scopes,
      createdAt,
      updatedAt
    } = input

    this.id = id || generateUID()
    this.organizationId = organizationId
    this.name = name
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.redirectUris = redirectUris
    this.scopes = scopes
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
  }
}
