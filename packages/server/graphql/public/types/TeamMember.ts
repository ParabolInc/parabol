import ms from 'ms'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import {getUserId} from '../../../utils/authorization'
import getAllRepoIntegrationsRedisKey from '../../../utils/getAllRepoIntegrationsRedisKey'
import getRedis from '../../../utils/getRedis'
import standardError from '../../../utils/standardError'
import connectionFromTasks from '../../queries/helpers/connectionFromTasks'
import fetchAllRepoIntegrations from '../../queries/helpers/fetchAllRepoIntegrations'
import getAllCachedRepoIntegrations from '../../queries/helpers/getAllCachedRepoIntegrations'
import getPrevUsedRepoIntegrations from '../../queries/helpers/getPrevUsedRepoIntegrations'
import {default as sortRepoIntegrations} from '../../queries/helpers/sortRepoIntegrations'
import {TeamMemberResolvers} from '../resolverTypes'

const TeamMember: TeamMemberResolvers = {
  isOrgAdmin: async ({teamId, userId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    const organizationUser = await dataLoader
      .get('organizationUsersByUserIdOrgId')
      .load({userId, orgId: team.orgId})
    return organizationUser?.role === 'ORG_ADMIN'
  },

  isSelf: (source, _args, {authToken}) => {
    const userId = getUserId(authToken)
    return source.userId === userId
  },

  integrations: ({teamId, userId}) => {
    return {teamId, userId}
  },

  meetingMember: async ({userId}, {meetingId}, {dataLoader}) => {
    const meetingMemberId = MeetingMemberId.join(meetingId, userId)
    return meetingId ? dataLoader.get('meetingMembers').loadNonNull(meetingMemberId) : null
  },

  prevUsedRepoIntegrations: async ({teamId, userId}, {first}, context) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)
    if (userId !== viewerId) {
      const user = await dataLoader.get('users').loadNonNull(userId)
      const {tms} = user
      const onTeam = authToken.tms.find((teamId) => tms.includes(teamId))
      if (!onTeam) {
        return standardError(new Error('Not on same team as user'), {userId: viewerId})
      }
    }
    const prevUsedRepoIntegrations = await getPrevUsedRepoIntegrations(teamId)
    if (!prevUsedRepoIntegrations) return {hasMore: false, items: []}
    if (prevUsedRepoIntegrations.length > first) {
      return {hasMore: true, items: prevUsedRepoIntegrations.slice(0, first)}
    } else {
      return {hasMore: false, items: prevUsedRepoIntegrations}
    }
  },

  repoIntegrations: async ({teamId, userId}, {first, networkOnly}, context, info) => {
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)
    if (userId !== viewerId) {
      const user = await dataLoader.get('users').loadNonNull(userId)
      const {tms} = user
      const onTeam = authToken.tms.find((teamId) => tms.includes(teamId))
      if (!onTeam) {
        return standardError(new Error('Not on same team as user'), {userId: viewerId})
      }
    }
    const [allCachedRepoIntegrations, prevUsedRepoIntegrations] = await Promise.all([
      getAllCachedRepoIntegrations(teamId, viewerId),
      getPrevUsedRepoIntegrations(teamId)
    ])
    const ignoreCache = networkOnly || !allCachedRepoIntegrations?.length
    const allRepoIntegrations = ignoreCache
      ? await fetchAllRepoIntegrations(teamId, userId, context, info)
      : allCachedRepoIntegrations
    if (ignoreCache) {
      // create a new cache with newly fetched allRepoIntegrations
      const redis = getRedis()
      const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId, viewerId)
      redis.set(allRepoIntegrationsKey, JSON.stringify(allRepoIntegrations), 'PX', ms('90d'))
    }
    const sortedRepoIntegrations = await sortRepoIntegrations(
      allRepoIntegrations,
      prevUsedRepoIntegrations
    )
    if (sortedRepoIntegrations.length > first) {
      return {hasMore: true, items: sortedRepoIntegrations.slice(0, first)}
    } else {
      return {hasMore: false, items: sortedRepoIntegrations}
    }
  },

  tasks: async ({teamId, userId}, _args, {dataLoader}) => {
    const allTasks = await dataLoader.get('tasksByTeamId').load(teamId)
    const publicTasksForUserId = allTasks.filter((task) => {
      if (task.userId !== userId) return false
      if (isTaskPrivate(task.tags)) return false
      return true
    })
    return connectionFromTasks(publicTasksForUserId)
  },

  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },

  user: ({userId}, _args, {dataLoader}) => {
    return dataLoader.get('users').loadNonNull(userId)
  }
}

export default TeamMember
