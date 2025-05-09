import {fetch} from '@whatwg-node/fetch'
import base64url from 'base64url'
import {sql} from 'kysely'
import ms from 'ms'
import DomainJoinRequestId from 'parabol-client/shared/gqlIds/DomainJoinRequestId'
import MeetingMemberId from 'parabol-client/shared/gqlIds/MeetingMemberId'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import {isNotNull} from 'parabol-client/utils/predicates'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import sortByTier from 'parabol-client/utils/sortByTier'
import {
  AUTO_GROUPING_THRESHOLD,
  MAX_REDUCTION_PERCENTAGE,
  MAX_RESULT_GROUP_SIZE
} from '../../../../client/utils/constants'
import groupReflections from '../../../../client/utils/smartGroup/groupReflections'
import MeetingTemplate from '../../../database/types/MeetingTemplate'
import getKysely from '../../../postgres/getKysely'
import {selectNewMeetings, selectNotifications, selectTasks} from '../../../postgres/select'
import {getUserId, isSuperUser, isTeamMember} from '../../../utils/authorization'
import getDomainFromEmail from '../../../utils/getDomainFromEmail'
import getMonthlyStreak from '../../../utils/getMonthlyStreak'
import getRedis from '../../../utils/getRedis'
import {getSSOMetadataFromURL} from '../../../utils/getSSOMetadataFromURL'
import sendToSentry from '../../../utils/sendToSentry'
import standardError from '../../../utils/standardError'
import errorFilter from '../../errorFilter'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import connectionFromTasks from '../../queries/helpers/connectionFromTasks'
import connectionFromTemplateArray from '../../queries/helpers/connectionFromTemplateArray'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {aiPrompts} from '../fields/aiPrompts'
import {invoices} from '../fields/invoices'
import {pageInsights} from '../fields/pageInsights'
import getSignOnURL from '../mutations/helpers/SAMLHelpers/getSignOnURL'
import {ReqResolvers} from './ReqResolvers'

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

const getValidUserIds = async (
  userIds: null | string[] | undefined,
  viewerId: string,
  validTeamIds: string[],
  dataLoader: DataLoaderWorker
) => {
  if (!userIds) return null
  if (userIds.length === 1 && userIds[0] === viewerId) return userIds
  // NOTE: this will filter out ex-teammembers. if that's a problem, we should use a different dataloader
  const teamMembersByUserIds = (
    await dataLoader.get('teamMembersByUserId').loadMany(userIds as string[])
  ).filter(errorFilter)
  const teamMembersOnValidTeams = teamMembersByUserIds
    .flat()
    .filter((teamMember) => validTeamIds.includes(teamMember.teamId))
  const teamMemberUserIds = new Set(
    teamMembersOnValidTeams.map(({userId}: {userId: string}) => userId)
  )
  return userIds.filter((userId) => teamMemberUserIds.has(userId))
}

const User: ReqResolvers<'User'> = {
  organization: async (_source, {orgId}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const [organization, viewerOrganizationUser] = await Promise.all([
      dataLoader.get('organizations').loadNonNull(orgId),
      dataLoader.get('organizationUsersByUserIdOrgId').load({userId: viewerId, orgId})
    ])
    if (!isSuperUser(authToken) && !viewerOrganizationUser) return null
    return organization
  },
  invoices,
  archivedTasks: async (_source, {first, after, teamId}, {authToken}) => {
    // AUTH
    const userId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      standardError(new Error('Not organization lead'), {userId})
      return null
    }

    // RESOLUTION
    const tasks = await selectTasks()
      .where('teamId', '=', teamId)
      .$if(!!after, (qb) => qb.where('updatedAt', '<=', after!))
      .where(sql<boolean>`'archived' = ANY(tags)`)
      .where(({eb, or}) => or([sql<boolean>`'private' != ALL(tags)`, eb('userId', '=', userId)]))
      .orderBy('updatedAt', 'desc')
      .limit(first + 1)
      .execute()

    const nodes = tasks.slice(0, first)
    const edges = nodes.map((node) => ({
      cursor: node.updatedAt,
      node
    }))
    const firstEdge = edges[0]
    return {
      edges,
      pageInfo: {
        startCursor: firstEdge && firstEdge.cursor,
        endCursor: firstEdge ? edges[edges.length - 1]!.cursor : new Date(),
        hasNextPage: tasks.length > nodes.length,
        hasPreviousPage: false
      }
    }
  },
  archivedTasksCount: async (_source, {teamId}, {authToken}) => {
    const pg = getKysely()
    const viewerId = getUserId(authToken)

    // AUTH
    const userId = getUserId(authToken)
    if (!isTeamMember(authToken, teamId)) {
      standardError(new Error('Team not found'), {userId: viewerId})
      return 0
    }

    // RESOLUTION
    const taskCount = await pg
      .selectFrom('Task')
      .select(({fn}) => fn.count('id').as('count'))
      .where('teamId', '=', teamId)
      .where(sql<boolean>`'archived' = ANY(tags)`)
      .where(({eb, or}) => or([sql<boolean>`'private' != ALL(tags)`, eb('userId', '=', userId)]))
      .executeTakeFirstOrThrow()
    return Number(taskCount.count)
  },
  meeting: async (_source, {meetingId}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    if (!meeting) {
      standardError(new Error('Meeting not found'), {userId: viewerId, tags: {meetingId}})
      return null
    }
    const {teamId} = meeting
    if (!isTeamMember(authToken, teamId)) {
      const meetingMemberId = toTeamMemberId(meetingId, viewerId)
      const meetingMember = await dataLoader.get('meetingMembers').load(meetingMemberId)
      if (!meetingMember) {
        // standardError(new Error('Team not found'), {userId: viewerId, tags: {teamId}})
        return null
      }
    }
    return meeting
  },
  meetings: async (
    _source,
    {after, first, teamIds, meetingTypes, before},
    {authToken, dataLoader}
  ) => {
    const viewerId = getUserId(authToken)
    let validTeamIds = teamIds
    if (authToken.rol !== 'su') {
      const teamMembers = await dataLoader.get('teamMembersByUserId').load(viewerId)
      const allTeamIds = teamMembers.map(({teamId}) => teamId)
      validTeamIds = teamIds.filter((teamId) => allTeamIds.includes(teamId))
    }
    if (validTeamIds.length < 1)
      throw new Error('Must provide at least 1 teamId the viewer is a member of')
    if (meetingTypes.length < 1) throw new Error('Must provide at least 1 meetingType')

    const nodes = await selectNewMeetings()
      .where('teamId', 'in', validTeamIds)
      .where('meetingType', 'in', meetingTypes)
      .$if(!!after, (qb) => qb.where('createdAt', '>=', after!))
      .$if(!!before, (qb) => qb.where('createdAt', '<=', before!))
      .limit(first + 1)
      .execute()
    return {
      edges: nodes.map((node) => ({node, cursor: node.createdAt})).slice(0, first),
      pageInfo: {
        hasNextPage: nodes.length > first,
        hasPreviousPage: false,
        startCursor: nodes.at(0)?.createdAt ?? null,
        endCursor: nodes.at(-1)?.createdAt ?? null
      }
    }
  },
  notifications: async (_source, {first, after, types}, {authToken}) => {
    const userId = getUserId(authToken)
    const hasTypes = types ? types.length > 0 : false
    // TODO consider moving the requestedFields to all queries
    const nodesPlus1 = await selectNotifications()
      .where('userId', '=', userId)
      .$if(hasTypes, (qb) => qb.where('type', 'in', types!))
      .$if(!!after, (qb) => qb.where('createdAt', '<', after!))
      .orderBy('createdAt', 'desc')
      .limit(first + 1)
      .execute()

    const nodes = nodesPlus1.slice(0, first)
    const edges = nodes.map((node) => ({
      cursor: node.createdAt,
      node
    }))
    const lastEdge = edges[edges.length - 1]
    return {
      edges,
      pageInfo: {
        endCursor: lastEdge?.cursor,
        hasNextPage: nodesPlus1.length > first,
        hasPreviousPage: false
      }
    }
  },
  tasks: async (
    _source,
    {first, after, userIds, teamIds, archived, statusFilters, filterQuery, includeUnassigned},
    {authToken, dataLoader}
  ) => {
    // AUTH
    const viewerId = getUserId(authToken)
    // VALIDATE
    if ((teamIds && teamIds.length > 100) || (userIds && userIds.length > 100)) {
      const err = new Error('Task filter is too broad')
      standardError(err, {
        userId: viewerId,
        tags: {userIds: JSON.stringify(userIds), teamIds: JSON.stringify(teamIds)}
      })
      return connectionFromTasks([], 0, err)
    }
    // common queries
    // - give me all the tasks for a particular team (users: all, team: abc)
    // - give me all the tasks for a particular user (users: 123, team: all)
    // - give me all the tasks for a number of teams (users: all, team: [abc, def])
    // - give me all the tasks for a number of users (users: [123, 456], team: all)
    // - give me all the tasks for a set of users & teams (users: [123, 456], team: [abc, def])
    // - give me all the tasks for all the users on all the teams (users: all, team: all)

    // if archived is true & no userId filter is provided, it should include tasks for ex-team members
    // under no condition should it show tasks for archived teams
    const accessibleTeamIds = authToken.tms
    const validTeamIds = teamIds
      ? teamIds.filter((teamId: string) => accessibleTeamIds.includes(teamId))
      : accessibleTeamIds
    const validUserIds = (await getValidUserIds(userIds, viewerId, validTeamIds, dataLoader)) ?? []
    // RESOLUTION
    const tasks = await dataLoader.get('userTasks').load({
      first,
      after,
      userIds: validUserIds,
      teamIds: validTeamIds,
      archived,
      statusFilters,
      filterQuery,
      includeUnassigned
    })
    const filteredTasks = tasks.filter((task) => {
      if (isTaskPrivate(task.tags) && task.userId !== viewerId) return false
      return true
    })
    return connectionFromTasks(filteredTasks, first)
  },
  team: async (_source, {teamId}, {authToken, dataLoader}, {operation}) => {
    // HANDLED_OPS is a list of operations that we gracefully handle on the client, so we don't want to report them to sentry
    const HANDLED_OPS = ['TeamRootQuery', 'TeamContainerQuery']
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const {orgId} = team
    const viewerId = getUserId(authToken)
    const {role} =
      (await dataLoader.get('organizationUsersByUserIdOrgId').load({userId: viewerId, orgId})) ?? {}
    const isOrgAdmin = role === 'ORG_ADMIN'
    if (!isOrgAdmin && !isTeamMember(authToken, teamId) && !isSuperUser(authToken)) {
      const viewerId = getUserId(authToken)
      if (!HANDLED_OPS.includes(operation?.name?.value ?? '')) {
        standardError(new Error('Team not found'), {userId: viewerId})
      }
      return null
    }
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  createdAt: ({createdAt}) => createdAt || new Date('2016-06-01'),

  isAnyBillingLeader: async ({id: userId}, _args, {dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    return organizationUsers.some(
      (organizationUser) =>
        organizationUser.role === 'BILLING_LEADER' || organizationUser.role === 'ORG_ADMIN'
    )
  },

  isConnected: async ({id: userId}) => {
    const redis = getRedis()
    const connectedSocketsCount = await redis.llen(`presence:${userId}`)
    return connectedSocketsCount > 0
  },

  isPatientZero: ({isPatient0}) => isPatient0,

  isRemoved: ({isRemoved}) => !!isRemoved,

  isWatched: ({isWatched}) => !!isWatched,

  lastMetAt: async ({id: userId}, _args, {dataLoader}) => {
    const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
    const lastMetAt = Math.max(0, ...meetingMembers.map(({updatedAt}) => updatedAt.getTime()))
    return lastMetAt ? new Date(lastMetAt) : null
  },

  meetingCount: async ({id: userId}, _args, {dataLoader}) => {
    const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
    return meetingMembers.length
  },

  monthlyStreakMax: async ({id: userId}, _args, {dataLoader}) => {
    const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
    const meetingDates = meetingMembers
      .map(({updatedAt}) => updatedAt.getTime())
      .sort((a, b) => (a < b ? 1 : -1))

    return getMonthlyStreak(meetingDates)
  },

  monthlyStreakCurrent: async ({id: userId}, _args, {dataLoader}) => {
    const meetingMembers = await dataLoader.get('meetingMembersByUserId').load(userId)
    const meetingDates = meetingMembers
      .map(({updatedAt}) => updatedAt.getTime())
      .sort((a, b) => (a < b ? 1 : -1))
    return getMonthlyStreak(meetingDates, true)
  },

  suggestedActions: async ({id: userId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    if (viewerId !== userId) return []
    const suggestedActions = await dataLoader.get('suggestedActionsByUserId').load(userId)
    suggestedActions.sort((a, b) => (a.priority! < b.priority! ? -1 : 1))
    return suggestedActions
  },

  timeline: async (
    {id},
    {after, first, teamIds, eventTypes, archived},
    {authToken, dataLoader}
  ) => {
    const viewerId = getUserId(authToken)

    // VALIDATE
    if (teamIds && teamIds.length > 100) {
      const error = new Error('Timeline filter is too broad')
      standardError(error, {
        userId: viewerId,
        tags: {teamIds: JSON.stringify(teamIds)}
      })
      return {
        error,
        pageInfo: {
          startCursor: after,
          endCursor: after,
          hasNextPage: false,
          hasPreviousPage: false
        },
        edges: []
      }
    }
    const userTeamMembers = await dataLoader.get('teamMembersByUserId').load(viewerId)
    const accessibleTeamIds = userTeamMembers.map(({teamId}) => teamId)
    const validTeamIds = teamIds
      ? teamIds.filter((teamId: string) => accessibleTeamIds.includes(teamId))
      : accessibleTeamIds
    if (validTeamIds.length === 0)
      return {error: 'No teams', pageInfo: {hasNextPage: false, hasPreviousPage: false}, edges: []}

    if (viewerId !== id && !isSuperUser(authToken))
      return {error: 'Not user', pageInfo: {hasNextPage: false, hasPreviousPage: false}, edges: []}
    const dbAfter = after ? new Date(after) : new Date('3000-01-01')
    const minVal = new Date(0)

    const pg = getKysely()
    const hasEventTypes = eventTypes ? eventTypes.length > 0 : false
    const events = await pg
      .selectFrom('TimelineEvent')
      .selectAll()
      .where('userId', '=', viewerId)
      .where((eb) => eb.between('createdAt', minVal, dbAfter))
      .where('isActive', '=', !archived)
      .where('teamId', 'in', validTeamIds)
      .$if(hasEventTypes, (db) => db.where('type', 'in', eventTypes!))
      .orderBy('createdAt', 'desc')
      .limit(first + 1)
      .execute()
    const edges = events.slice(0, first).map((node) => ({
      cursor: node.createdAt,
      node
    }))
    const [firstEdge] = edges
    return {
      // FIXME orgId can be null sometimes
      edges: edges as any,
      pageInfo: {
        startCursor: firstEdge ? firstEdge.cursor : null,
        // FIXME: the PageInfo type should be a GraphQLISO8601 type, but fixing that requires more work
        // because the type is shared all over so we'll have to verify that the change doesn't break anything
        endCursor: firstEdge ? (new Date(edges[edges.length - 1]!.cursor).toJSON() as any) : null,
        hasNextPage: events.length > edges.length,
        hasPreviousPage: false
      }
    }
  },

  discussion: async (_source, {id}, {authToken, dataLoader}) => {
    const discussion = await dataLoader.get('discussions').load(id)
    if (!discussion) return null
    const {teamId} = discussion
    if (!isTeamMember(authToken, teamId)) {
      return null
    }
    return discussion
  },

  newFeature: ({newFeatureId}, _args, {dataLoader}) => {
    return newFeatureId ? dataLoader.get('newFeatures').loadNonNull(newFeatureId) : null
  },

  lastSeenAtURLs: async ({id: userId}) => {
    const redis = getRedis()
    const userPresence = await redis.lrange(`presence:${userId}`, 0, -1)
    if (!userPresence || userPresence.length === 0) return null
    return userPresence.map((socket) => JSON.parse(socket).lastSeenAtURL)
  },

  meetingMember: async ({id: userId}, {meetingId}, {dataLoader}) => {
    const meetingMemberId = toTeamMemberId(meetingId, userId)
    return meetingId ? dataLoader.get('meetingMembers').loadNonNull(meetingMemberId) : null
  },

  organizationUser: async ({id: userId}, {orgId}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const [viewerOrganizationUser, userOrganizationUser] = await Promise.all([
      dataLoader.get('organizationUsersByUserIdOrgId').load({userId: viewerId, orgId}),
      dataLoader.get('organizationUsersByUserIdOrgId').load({userId, orgId})
    ])
    if (viewerOrganizationUser || isSuperUser(authToken)) return userOrganizationUser
    return null
  },

  organizationUsers: async ({id: userId}, _args, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    organizationUsers.sort((a, b) => (a.orgId > b.orgId ? 1 : -1))
    if (viewerId === userId || isSuperUser(authToken)) {
      return organizationUsers
    }
    const viewerOrganizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const viewerOrgIds = viewerOrganizationUsers.map(({orgId}) => orgId)
    return organizationUsers.filter((organizationUser) =>
      viewerOrgIds.includes(organizationUser.orgId)
    )
  },

  organizations: async ({id: userId}, _args, {authToken, dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const orgIds = organizationUsers.map(({orgId}) => orgId)
    const organizations = (await dataLoader.get('organizations').loadMany(orgIds)).filter(isValid)
    const sortedOrgs = sortByTier(organizations)
    const viewerId = getUserId(authToken)
    if (viewerId === userId || isSuperUser(authToken)) {
      return sortedOrgs
    }
    const viewerOrganizationUsers = await dataLoader.get('organizationUsersByUserId').load(viewerId)
    const viewerOrgIds = viewerOrganizationUsers.map(({orgId}) => orgId)
    return sortedOrgs.filter((organization) => viewerOrgIds.includes(organization.id))
  },

  overLimitCopy: async ({id: userId, overLimitCopy}, _args, {dataLoader}) => {
    const organizationUsers = await dataLoader.get('organizationUsersByUserId').load(userId)
    const isAnyMemberOfPaidOrg = organizationUsers.some(
      (organizationUser) => organizationUser.tier !== 'starter'
    )
    if (isAnyMemberOfPaidOrg) return null
    return overLimitCopy
  },

  similarReflectionGroups: async (
    {id: userId},
    {reflectionGroupId, searchQuery: rawSearchQuery},
    {dataLoader}
  ) => {
    const searchQuery = rawSearchQuery.toLowerCase().trim()
    const retroReflectionGroup = await dataLoader
      .get('retroReflectionGroups')
      .load(reflectionGroupId)
    if (!retroReflectionGroup) {
      throw new Error('Invalid reflection group id')
    }
    const {meetingId} = retroReflectionGroup
    const meetingMemberId = MeetingMemberId.join(meetingId, userId)
    const [viewerMeetingMember, reflections] = await Promise.all([
      dataLoader.get('meetingMembers').load(meetingMemberId),
      dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
    ])
    if (!viewerMeetingMember) {
      throw new Error('Not a member of meeting')
    }

    if (searchQuery !== '') {
      const matchedReflections = reflections.filter(({plaintextContent}) =>
        plaintextContent.toLowerCase().includes(searchQuery)
      )
      const relatedReflections = matchedReflections.filter(
        ({reflectionGroupId: groupId}) => groupId !== reflectionGroupId
      )
      const relatedGroupIds = [
        ...new Set(relatedReflections.map(({reflectionGroupId}) => reflectionGroupId))
      ].slice(0, MAX_RESULT_GROUP_SIZE)
      return (await dataLoader.get('retroReflectionGroups').loadMany(relatedGroupIds)).filter(
        isValid
      )
    }

    const reflectionsCount = reflections.length
    const spotlightResultGroupSize = Math.min(reflectionsCount - 1, MAX_RESULT_GROUP_SIZE)
    let currentResultGroupIds = new Set<string>()
    let currentThresh: number | null = AUTO_GROUPING_THRESHOLD
    while (currentThresh) {
      const nextResultGroupIds = new Set<string>()
      const res = groupReflections(reflections, {
        groupingThreshold: currentThresh,
        maxGroupSize: reflectionsCount,
        maxReductionPercent: MAX_REDUCTION_PERCENTAGE
      })
      const {groupedReflectionsRes} = res
      const nextThresh = res.nextThresh as number | null
      const spotlightGroupedReflection = groupedReflectionsRes.find(
        (group) => group.oldReflectionGroupId === reflectionGroupId
      )
      if (!spotlightGroupedReflection) break
      for (const groupedReflectionRes of groupedReflectionsRes) {
        const {reflectionGroupId, oldReflectionGroupId} = groupedReflectionRes
        if (
          reflectionGroupId === spotlightGroupedReflection.reflectionGroupId &&
          oldReflectionGroupId !== spotlightGroupedReflection.oldReflectionGroupId
        ) {
          nextResultGroupIds.add(oldReflectionGroupId)
        }
        currentThresh = nextThresh
        if (nextResultGroupIds.size > spotlightResultGroupSize) {
          currentThresh = null
          break
        } else {
          currentResultGroupIds = nextResultGroupIds
          if (nextResultGroupIds.size === spotlightResultGroupSize) {
            currentThresh = null
            break
          }
        }
      }
    }
    return (
      await dataLoader.get('retroReflectionGroups').loadMany(Array.from(currentResultGroupIds))
    ).filter(isValid)
  },

  teamInvitation: async ({id: userId}, {meetingId, teamId: inTeamId}, {authToken, dataLoader}) => {
    if (!meetingId && !inTeamId) return {}
    const viewerId = getUserId(authToken)
    if (viewerId !== userId && !isSuperUser(authToken)) return {}
    const user = (await dataLoader.get('users').load(userId))!
    const {email} = user
    let teamId = inTeamId
    if (!teamId && meetingId) {
      const meeting = await dataLoader.get('newMeetings').load(meetingId)
      if (!meeting) return {meetingId}
      teamId = meeting.teamId
    }
    const teamInvitations = teamId
      ? await dataLoader.get('teamInvitationsByTeamId').load(teamId)
      : null
    if (!teamInvitations) return {teamId, meetingId}
    const teamInvitation = teamInvitations.find((invitation) => invitation.email === email)
    return {teamInvitation, teamId, meetingId}
  },

  teams: async ({id: userId}, {includeArchived}, {authToken, dataLoader}) => {
    const viewerId = getUserId(authToken)
    const user = (await dataLoader.get('users').load(userId))!
    const activeTeamIds =
      viewerId === userId || isSuperUser(authToken)
        ? user.tms
        : user.tms.filter((teamId: string) => authToken.tms.includes(teamId))
    const teamIds = includeArchived
      ? (await dataLoader.get('teamMembersByUserId').load(userId)).map(({teamId}) => teamId)
      : activeTeamIds
    const teams = (await dataLoader.get('teams').loadMany(teamIds)).filter(isValid)
    teams.sort((a, b) => (a.name > b.name ? 1 : -1))
    return teams
  },

  teamMember: ({id}, {teamId, userId}, {authToken, dataLoader}) => {
    if (!isTeamMember(authToken, teamId)) {
      const viewerId = getUserId(authToken)
      standardError(new Error('Not on team'), {userId: viewerId})
      return null
    }
    const teamMemberId = toTeamMemberId(teamId, userId || id)
    return dataLoader.get('teamMembers').loadNonNull(teamMemberId)
  },

  tms: ({id: userId, tms}, _args, {authToken}) => {
    const viewerId = getUserId(authToken)
    return viewerId === userId
      ? tms
      : tms.filter((teamId: string) => authToken.tms.includes(teamId))
  },

  userOnTeam: async (_source, {userId}, {authToken, dataLoader}) => {
    const userOnTeam = await dataLoader.get('users').load(userId)
    if (!userOnTeam) {
      return null
    }
    // const teams = new Set(userOnTeam)
    const {tms} = userOnTeam
    if (!authToken.tms.find((teamId) => tms.includes(teamId))) return null
    return userOnTeam
  },
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
      orgIds.map((orgId) => dataLoader.get('organizations').loadNonNull(orgId))
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
  featureFlag: async ({id: userId}, {featureName}, {dataLoader}) => {
    return await dataLoader.get('featureFlagByOwnerId').load({ownerId: userId, featureName})
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
          .selectFrom(MODEL as any)
          // @ts-ignore
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
  billingTier: ({tier}) => tier,
  pageInsights,
  aiPrompts
}

export default User
