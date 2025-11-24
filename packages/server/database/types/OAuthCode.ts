import generateUID from '../../generateUID'
import {toEpochSeconds} from '../../utils/epochTime'

interface Input {
  id?: string
  clientId: string
  redirectUri: string
  userId: string
  scopes: string[]
  expiresAt?: number
}

export default class OAuthCode {
  id: string
  clientId: string
  redirectUri: string
  userId: string
  scopes: string[]
  expiresAt: number
  createdAt: number

  constructor(input: Input) {
    const {id, clientId, redirectUri, userId, scopes, expiresAt} = input
    const now = new Date()

    this.id = id || generateUID()
    this.clientId = clientId
    this.redirectUri = redirectUri
    this.userId = userId
    this.scopes = scopes
    this.createdAt = toEpochSeconds(now)
    // Default expiration: 10 minutes
    this.expiresAt = expiresAt || toEpochSeconds(now.getTime() + 10 * 60 * 1000)
  }
}
