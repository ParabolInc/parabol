import generateUID from '../../generateUID'

interface Input {
  id?: string
  clientId: string
  redirectUri: string
  userId: string
  scopes: string[]
  expiresAt?: Date
}

export default class OAuthAPICode {
  id: string
  clientId: string
  redirectUri: string
  userId: string
  scopes: string[]
  expiresAt: Date
  createdAt: Date

  constructor(input: Input) {
    const {id, clientId, redirectUri, userId, scopes, expiresAt} = input
    const now = new Date()

    this.id = id || generateUID()
    this.clientId = clientId
    this.redirectUri = redirectUri
    this.userId = userId
    this.scopes = scopes
    this.createdAt = now
    this.expiresAt = expiresAt || new Date(now.getTime() + 10 * 60 * 1000) // 10 minutes from now
  }
}
