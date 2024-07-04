import base64url from 'base64url'
import ms from 'ms'
import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import {isNotNull} from 'parabol-client/utils/predicates'
import {Threshold} from '../../../../client/types/constEnums'
import fetchAllLines from '../../../billing/helpers/fetchAllLines'
import generateInvoice from '../../../billing/helpers/generateInvoice'
import generateUpcomingInvoice from '../../../billing/helpers/generateUpcomingInvoice'
import getRethink from '../../../database/rethinkDriver'
import MeetingTemplate from '../../../database/types/MeetingTemplate'
import getKysely from '../../../postgres/getKysely'
import {
  getUserId,
  isSuperUser,
  isTeamMember,
  isUserBillingLeader
} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import {getSSOMetadataFromURL} from '../../../utils/getSSOMetadataFromURL'
import sendToSentry from '../../../utils/sendToSentry'
import standardError from '../../../utils/standardError'
import {getStripeManager} from '../../../utils/stripe'
import isValid from '../../isValid'
import connectionFromTemplateArray from '../../queries/helpers/connectionFromTemplateArray'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import getSignOnURL from '../mutations/helpers/SAMLHelpers/getSignOnURL'
import {UserResolvers} from '../resolverTypes'

declare const __PRODUCTION__: string

const MODEL = 'Embeddings_ember_1'
const EMBED_URL = (() => {
  try {
    const availableModels =
      process.env.AI_EMBEDDING_MODELS && JSON.parse(process.env.AI_EMBEDDING_MODELS)
    return availableModels.find(
      ({model}: {model?: string}) => model?.split(':')[1] === 'llmrails/ember-v1'
    )?.url
  } catch {
    return undefined
  }
})()
const SIMILARITY_THRESHOLD = 0.5

const User: UserResolvers = {
  activity: async (_source, {activityId}, {dataLoader}) => {
    const activity = await dataLoader.get('meetingTemplates').load(activityId)
    return activity || null
  },
  canAccess: async (_source, {entity, id}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    switch (entity) {
      case 'Team':
        return isTeamMember(authToken, id)
      case 'Meeting':
        const meeting = await dataLoader.get('newMeetings').load(id)
        if (!meeting) {
          return false
        }
        const {teamId} = meeting
        return isTeamMember(authToken, teamId)
      case 'Organization':
        const organizationUser = await dataLoader
          .get('organizationUsersByUserIdOrgId')
          .load({userId: viewerId, orgId: id})
        return !!organizationUser
      default:
        return false
    }
  },
  company: async ({email}, _args, {authToken, dataLoader}) => {
    const domain = getDomainFromEmail(email)
    if (
      !domain ||
      !isSuperUser(authToken) ||
      !(await dataLoader.get('isCompanyDomain').load(domain))
    ) {
      return null
    }
    return {id: domain}
  },
  domains: async ({id: userId}, _args, {dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const orgIds = organizationUsers
      .filter(({suggestedTier}) => suggestedTier)
      .map(({orgId}) => orgId)

    const organizations = await Promise.all(
      orgIds.map((orgId) => dataLoader.get('organizations').load(orgId))
    )
    const approvedDomains = organizations.map(({activeDomain}) => activeDomain).filter(isNotNull)
    return [...new Set(approvedDomains)].map((id) => ({id}))
  },
  domainJoinRequest: async ({email}, {requestId}, {dataLoader}) => {
    const request = await dataLoader
      .get('domainJoinRequests')
      .loadNonNull(DomainJoinRequestId.split(requestId))
    const domain = getDomainFromEmail(email)
    if (domain !== request.domain) {
      return null
    }
    return request
  },
  favoriteTemplates: async ({favoriteTemplateIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('meetingTemplates').loadMany(favoriteTemplateIds)).filter(isValid)
  },
  featureFlags: ({featureFlags}) => {
    return Object.fromEntries(featureFlags.map((flag) => [flag as any, true]))
  },
  invoiceDetails: async (_source, {invoiceId}, {authToken, dataLoader}) => {
    const r = await getRethink()
    const now = new Date()

    const viewerId = getUserId(authToken)
    const isUpcoming = invoiceId.startsWith('upcoming_')
    const currentInvoice = await r.table('Invoice').get(invoiceId).default(null).run()
    const orgId = (currentInvoice && currentInvoice.orgId) || invoiceId.substring(9) // remove 'upcoming_'
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      standardError(new Error('Not organization lead'), {userId: viewerId})
      return null
    }
    if (currentInvoice) {
      const invalidAt = new Date(
        currentInvoice.createdAt.getTime() + Threshold.UPCOMING_INVOICE_TIME_VALID
      )
      if (invalidAt > now) return currentInvoice
    }
    if (isUpcoming) {
      return generateUpcomingInvoice(orgId, dataLoader)
    }
    const manager = getStripeManager()
    const stripeLineItems = await fetchAllLines(invoiceId)
    const invoice = await manager.retrieveInvoice(invoiceId)
    return generateInvoice(invoice, stripeLineItems, orgId, invoiceId, dataLoader)
  },
  availableTemplates: async ({id: userId}, {first, after, type}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const user = await dataLoader.get('users').loadNonNull(userId)
    const teamIds =
      viewerId === userId || isSuperUser(authToken)
        ? user.tms
        : user.tms.filter((teamId: string) => authToken.tms.includes(teamId))

    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const userOrgIds = organizationUsers.map(({orgId}) => orgId)
    const availableOrgIds = ['aGhostOrg', ...userOrgIds]
    const [parabolActivities, ...userActivities] = await Promise.all(
      availableOrgIds.map((orgId) => dataLoader.get('meetingTemplatesByOrgId').load(orgId))
    )
    const allUserActivities = userActivities.flat().filter((activity) => {
      return activity.scope !== 'TEAM' || teamIds.includes(activity.teamId)
    })

    if (!__PRODUCTION__) {
      if (parabolActivities!.length + allUserActivities.length > first) {
        throw new Error(
          'Please implement pagination for User.activities or increase `first` for the query'
        )
      }
    } else if (parabolActivities!.length + allUserActivities.length > 1000) {
      sendToSentry(new Error('User.activities exceeds 1000 activities'), {
        userId,
        extras: {numActivities: parabolActivities!.length + allUserActivities.length}
      })
    }
    const getScore = (activity: MeetingTemplate, teamIds: string[]) => {
      const SEASONAL = 1 << 8 // put seasonal templates at the top
      const IS_STANDUP = 1 << 7 // prioritize standups but less than seasonal
      const USED_LAST_90 = 1 << 7 // next, show all templates used within the last 90 days
      const ON_TEAM = 1 << 6 // tiebreak by putting team templates first
      const ON_ORG = 1 << 5 // then org templates
      const IS_FREE = 1 << 4 // then free parabol templates
      const USED_LAST_30 = 1 << 3 // tiebreak on being used in last 30
      const {hideStartingAt, teamId, orgId, lastUsedAt, isFree} = activity
      const isStandup = activity.type === 'teamPrompt'
      const isSeasonal = !!hideStartingAt
      const isOnTeam = teamIds.includes(teamId)
      const isOnOrg = orgId !== 'aGhostOrg' && !isOnTeam
      const isUsedLast30 = lastUsedAt && lastUsedAt > new Date(Date.now() - ms('30d'))
      const isUsedLast90 = lastUsedAt && lastUsedAt > new Date(Date.now() - ms('90d'))
      let score = 0
      if (isStandup) score += IS_STANDUP
      if (isSeasonal) score += SEASONAL
      if (isUsedLast90) score += USED_LAST_90
      if (isOnTeam) score += ON_TEAM
      if (isOnOrg) score += ON_ORG
      if (isFree) score += IS_FREE
      if (isUsedLast30) score += USED_LAST_30

      return score
    }
    const allActivities = [...parabolActivities!, ...allUserActivities]
      .map((activity) => ({
        ...activity,
        sortOrder: getScore(activity, teamIds)
      }))
      .filter((activity) => !type || activity.type === type)
      .sort((a, b) => (a.sortOrder > b.sortOrder ? -1 : 1))

    return connectionFromTemplateArray(allActivities, first, after)
  },
  templateSearch: async ({id: userId}, {search}, {authToken, dataLoader}) => {
    if (!search || !EMBED_URL) return []
    const viewerId = getUserId(authToken)
    const user = await dataLoader.get('users').loadNonNull(userId)
    const teamIds =
      viewerId === userId || isSuperUser(authToken)
        ? user.tms
        : user.tms.filter((teamId: string) => authToken.tms.includes(teamId))

    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const userOrgIds = organizationUsers.map(({orgId}) => orgId)

    const allOrgTeams = (await dataLoader.get('teamsByOrgIds').loadMany(userOrgIds))
      .filter(isValid)
      .flat()
    // all team ids which could have accessible templates
    const allTeamIds = ['aGhostTeam', ...allOrgTeams.map(({id}) => id)]

    const response = await fetch(EMBED_URL, {
      method: 'POST',
      body: JSON.stringify({inputs: search}),
      headers: {'Content-Type': 'application/json'}
    })
    const data = await response.json()

    const pg = getKysely()
    const similarEmbeddings = await pg
      .with('Model', (qc) =>
        qc
          .selectFrom(MODEL)
          .innerJoin('EmbeddingsMetadata', 'EmbeddingsMetadata.id', `${MODEL}.embeddingsMetadataId`)
          .select([`${MODEL}.id`, 'embeddingsMetadataId', 'embedding', 'refId'])
          .where('objectType', '=', 'meetingTemplate')
          .where('teamId', 'in', allTeamIds)
      )
      .with('CosineSimilarity', (pg) =>
        pg
          .selectFrom(['Model'])
          .select(({eb, val, parens, ref}) => [
            ref('Model.id').as('embeddingId'),
            ref('Model.embeddingsMetadataId').as('embeddingsMetadataId'),
            ref('Model.refId').as('refId'),
            eb(
              val(1),
              '-',
              parens('Model.embedding' as any, '<=>' as any, JSON.stringify(data[0]))
            ).as('similarity')
          ])
      )
      .selectFrom('CosineSimilarity')
      .select(['embeddingId', 'similarity', 'embeddingsMetadataId', 'refId'])
      .where('similarity', '>=', SIMILARITY_THRESHOLD)
      .orderBy('similarity', 'desc')
      .execute()

    const aiActivityIds = similarEmbeddings.map(({refId}) => refId)

    // TODO filter out seasonal templates
    const activities = await dataLoader.get('meetingTemplates').loadMany(aiActivityIds)
    const accessibleActivities = activities.filter(isValid).filter((activity) => {
      return activity.scope !== 'TEAM' || teamIds.includes(activity.teamId)
    })
    return accessibleActivities
  },
  parseSAMLMetadata: async (_source, {metadataURL, domain}) => {
    const metadata = await getSSOMetadataFromURL(metadataURL)
    if (metadata instanceof Error) return {error: {message: metadata.message}}
    const baseUrl = getSignOnURL(metadata, domain)
    if (baseUrl instanceof Error) {
      return {error: {message: baseUrl.message}}
    }
    // append the new metadataURL to the RelayState
    // The IdP will forward this to us and our SAMLHandler/loginSAML will use this instead of what's in the DB
    const relayState = base64url.encode(JSON.stringify({metadataURL}))
    const urlObj = new URL(baseUrl)
    urlObj.searchParams.append('RelayState', relayState)
    return {url: urlObj.toString()}
  },
  picture: async ({picture}, _args, {dataLoader}) => {
    return dataLoader.get('fileStoreAsset').load(picture)
  },
  rasterPicture: async ({picture}, _args, {dataLoader}) => {
    const rasterPicture =
      picture && picture.endsWith('.svg') ? picture.slice(0, -3) + 'png' : picture
    return dataLoader.get('fileStoreAsset').load(rasterPicture)
  },
  tier: ({tier, trialStartDate}) => {
    return getFeatureTier({tier, trialStartDate})
  },
  billingTier: ({tier}) => tier
}

export default User
