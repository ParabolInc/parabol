import Auth0Identity from './Auth0Identity'

interface Input {
  id: string
  preferredName: string
  email: string
  emailVerified?: boolean,
  featureFlags?: string[],
  lastLogin?: Date,
  updatedAt?: Date ,
  picture?: string,
  inactive?: boolean,
  identities?: Auth0Identity[] ,
  createdAt?: Date,
  segmentId?: string,
  tms?: string[]
}


const letters = 'abcdefghijklmnopqrstuvwxyz'
const AVATAR_BUCKET = `https://${process.env.AWS_S3_BUCKET}/static/avatars`

export default class User {
  id: string
  connectedSockets: string[]
  preferredName: string
  email: string
  emailVerified: boolean
  featureFlags: string[]
  lastLogin: Date | null
  updatedAt: Date
  picture: string
  inactive: boolean
  identities: Auth0Identity[]
  createdAt: Date
  segmentId?: string
  tms: string[]
  constructor (input: Input) {
    const {tms, email, id, createdAt, picture, updatedAt, emailVerified, featureFlags, identities, inactive, lastLogin, preferredName, segmentId} = input
    const avatarName = preferredName.split('').filter((letter) => letters.includes(letter)).slice(0,2).join('') || 'pa'
    const now = new Date()
    this.id = id
    this.connectedSockets = []
    this.tms = tms || []
    this.email = email
    this.createdAt = createdAt || now
    this.picture = picture || `${AVATAR_BUCKET}/${avatarName}.png`
    this.updatedAt = updatedAt || now
    this.emailVerified = emailVerified || false
    this.featureFlags = featureFlags || []
    this.identities = identities || []
    this.inactive = inactive || false
    this.lastLogin = lastLogin || null
    this.preferredName = preferredName
    this.segmentId = segmentId
  }
}
