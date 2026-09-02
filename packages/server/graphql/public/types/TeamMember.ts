import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import MeetingMemberId from '../../../../client/shared/gqlIds/MeetingMemberId'
import loadServiceRepoIntegrations from '../../../integrations/loadServiceRepoIntegrations'
import mergeRepoIntegrations from '../../../integrations/platform/mergeRepoIntegrations'
import {
  type RegisteredServerIntegration,
  serverIntegrations
} from '../../../integrations/platform/registry'
import {getUserId} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import connectionFromTasks from '../../queries/helpers/connectionFromTasks'
import getPrevUsedRepoIntegrations from '../../queries/helpers/getPrevUsedRepoIntegrations'
import type {TeamMemberResolvers} from '../resolverTypes'

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

  services: ({teamId, userId}) => {
    return Object.values(serverIntegrations).map((definition) => ({
      service: definition.service,
      title: definition.title,
      capabilities: definition.getCapabilityKeys(),
      teamId,
      userId
    }))
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
      const tms = await dataLoader.get('teamIdsByUserId').load(userId)
      const onTeam = authToken.tms.find((teamId) => tms.includes(teamId))
      if (!onTeam) {
        return standardError(new Error('Not on same team as user'), {
          userId: viewerId
        })
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
    const ctx = {dataLoader: context.dataLoader, teamId, userId, context, info}
    const services = Object.keys(serverIntegrations) as RegisteredServerIntegration[]
    const [prevUsedRepoIntegrations, repoLists, connected] = await Promise.all([
      getPrevUsedRepoIntegrations(teamId),
      Promise.all(
        services.map((service) => loadServiceRepoIntegrations(service, ctx, !!networkOnly))
      ),
      Promise.all(services.map((service) => serverIntegrations[service].isConnected(ctx)))
    ])
    const connectedServices = new Set(services.filter((_, idx) => connected[idx]))
    const items = mergeRepoIntegrations(
      (prevUsedRepoIntegrations ?? []).filter(({service}) => connectedServices.has(service)),
      repoLists.map((repos) => repos ?? [])
    )
    return {hasMore: items.length > first, items: items.slice(0, first)}
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
