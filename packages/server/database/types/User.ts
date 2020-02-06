import {AuthTokenRole} from 'parabol-client/types/constEnums'
import AuthIdentity from './AuthIdentity'
import shortid from 'shortid'
import {TierEnum} from 'parabol-client/types/graphql'

interface Input {
  id?: string
  preferredName: string
  email: string
  emailVerified?: boolean
  featureFlags?: string[]
  lastSeenAt?: Date
  lastSeenAtURL?: string
  updatedAt?: Date
  picture?: string
  inactive?: boolean
  identities?: AuthIdentity[]
  createdAt?: Date
  segmentId?: string
  tier?: TierEnum
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
  lastSeenAt: Date | null
  lastSeenAtURL: string | null
  updatedAt: Date
  newFeatureId?: string | null
  overLimitCopy?: string | null
  picture: string
  inactive: boolean
  identities: AuthIdentity[]
  isRemoved?: true
  createdAt: Date
  segmentId?: string
  tier: TierEnum
  tms: string[]
  rol?: AuthTokenRole.SUPER_USER
  constructor(input: Input) {
    const {
      tms,
      email,
      id,
      createdAt,
      picture,
      updatedAt,
      emailVerified,
      featureFlags,
      lastSeenAt,
      lastSeenAtURL,
      identities,
      inactive,
      preferredName,
      segmentId,
      tier
    } = input
    const avatarName =
      preferredName
        .toLowerCase()
        .split('')
        .filter((letter) => letters.includes(letter))
        .slice(0, 2)
        .join('') || 'pa'
    const now = new Date()
    this.id = id ?? `local|${shortid.generate()}`
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
    this.lastSeenAt = lastSeenAt ?? null
    this.lastSeenAtURL = lastSeenAtURL ?? null
    this.preferredName = preferredName
    this.segmentId = segmentId
    this.tier = tier ?? TierEnum.personal
  }
}
