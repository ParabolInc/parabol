import {AuthTokenRole} from 'parabol-client/types/constEnums'
import generateUID from '../../generateUID'
import {USER_PREFERRED_NAME_LIMIT} from '../../postgres/constants'
import {defaultTier} from '../../utils/defaultTier'
import AuthIdentity from './AuthIdentity'
import {TierEnum} from './Invoice'

interface Input {
  id?: string
  preferredName: string
  email: string
  favoriteTemplateIds?: string[]
  featureFlags?: string[]
  lastSeenAt?: Date
  lastSeenAtURLs?: string[]
  updatedAt?: Date
  picture: string
  inactive?: boolean
  identities?: AuthIdentity[]
  isWatched?: boolean
  createdAt?: Date
  pseudoId?: string | null
  sendSummaryEmail?: boolean
  tier?: TierEnum
  tms?: string[]
}

export default class User {
  id: string
  preferredName: string
  email: string
  favoriteTemplateIds: string[]
  featureFlags: string[]
  lastSeenAt: Date
  lastSeenAtURLs: string[] | null
  updatedAt: Date
  newFeatureId?: string | null
  overLimitCopy?: string | null
  picture: string
  inactive: boolean
  identities: AuthIdentity[]
  isRemoved?: boolean
  isWatched?: boolean
  createdAt: Date
  pseudoId?: string
  sendSummaryEmail?: boolean
  tier: TierEnum
  tms: string[]
  reasonRemoved?: string
  rol?: AuthTokenRole.SUPER_USER
  payLaterClickCount?: number
  constructor(input: Input) {
    const {
      tms,
      email,
      id,
      createdAt,
      picture,
      updatedAt,
      favoriteTemplateIds,
      featureFlags,
      lastSeenAt,
      lastSeenAtURLs,
      identities,
      inactive,
      isWatched,
      preferredName,
      pseudoId,
      sendSummaryEmail,
      tier
    } = input
    const now = new Date()
    this.id = id ?? `local|${generateUID()}`
    this.tms = tms || []
    this.email = email
    this.createdAt = createdAt || now
    this.picture = picture
    this.updatedAt = updatedAt || now
    this.favoriteTemplateIds = favoriteTemplateIds || []
    this.featureFlags = featureFlags || []
    this.identities = identities || []
    this.inactive = inactive || false
    this.isWatched = isWatched || false
    this.lastSeenAt = lastSeenAt ?? new Date()
    this.lastSeenAtURLs = lastSeenAtURLs ?? null
    this.preferredName = preferredName.trim().slice(0, USER_PREFERRED_NAME_LIMIT)
    this.pseudoId = pseudoId ?? undefined
    this.sendSummaryEmail = sendSummaryEmail ?? true
    this.tier = tier ?? defaultTier
  }
}
