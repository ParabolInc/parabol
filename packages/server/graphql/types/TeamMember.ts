import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import ms from 'ms'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {getUserId} from '../../utils/authorization'
import getAllRepoIntegrationsRedisKey from '../../utils/getAllRepoIntegrationsRedisKey'
import getPrevUsedRepoIntegrationsRedisKey from '../../utils/getPrevUsedRepoIntegrationsRedisKey'
import getRedis from '../../utils/getRedis'
import getTaskServicesWithPerms from '../../utils/getTaskServicesWithPerms'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import fetchAllRepoIntegrations from '../queries/helpers/fetchAllRepoIntegrations'
import getAllCachedRepoIntegrations from '../queries/helpers/getAllCachedRepoIntegrations'
import getPrevUsedRepoIntegrations from '../queries/helpers/getPrevUsedRepoIntegrations'
import removeStalePrevUsedRepoIntegrations from '../queries/helpers/removeStalePrevUsedRepoIntegations'
import {default as sortRepoIntegrations} from '../queries/helpers/sortRepoIntegrations'
import updateRepoIntegrationsCacheByPerms from '../queries/helpers/updateRepoIntegrationsCacheByPerms'
import {resolveTeam} from '../resolvers'
import GraphQLEmailType from './GraphQLEmailType'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import RepoIntegrationQueryPayload from './RepoIntegrationQueryPayload'
import {TaskConnection} from './Task'
import Team from './Team'
import TeamDrawerEnum from './TeamDrawerEnum'
import TeamMemberIntegrations from './TeamMemberIntegrations'
import User from './User'

const TeamMember = new GraphQLObjectType<any, GQLContext>({
  name: 'TeamMember',
  description: 'A member of a team',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'An ID for the teamMember. userId::teamId'
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLISO8601Type),
      description: 'The datetime the team member was created'
    },
    isNotRemoved: {
      type: GraphQLBoolean,
      description: 'true if the user is a part of the team, false if they no longer are'
    },
    isLead: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Is user a team lead?',
      resolve: ({isLead}) => !!isLead
    },
    isSpectatingPoker: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if the user prefers to not vote during a poker meeting',
      resolve: ({isSpectatingPoker}) => !!isSpectatingPoker
    },
    openDrawer: {
      type: TeamDrawerEnum,
      description: 'the type of drawer that is open in the team dash. Null if the drawer is closed'
    },
    /* denormalized from User */
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The user email'
    },
    picture: {
      type: new GraphQLNonNull(GraphQLURLType),
      description: 'url of user’s profile picture'
    },
    isSelf: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if this team member belongs to the user that queried it',
      resolve: (source, _args: unknown, {authToken}) => {
        const userId = getUserId(authToken)
        return source.userId === userId
      }
    },
    integrations: {
      type: new GraphQLNonNull(TeamMemberIntegrations),
      description: 'The integrations that the team member has authorized. accessible by all',
      resolve: ({teamId, userId}) => {
        return {teamId, userId}
      }
    },
    meetingMember: {
      type: require('./MeetingMember').default,
      description: 'The meeting specifics for the meeting the team member is currently in',
      args: {
        meetingId: {
          type: new GraphQLNonNull(GraphQLID)
        }
      },
      resolve: async ({userId}, {meetingId}, {dataLoader}) => {
        const meetingMemberId = toTeamMemberId(meetingId, userId)
        return meetingId ? dataLoader.get('meetingMembers').load(meetingMemberId) : undefined
      }
    },
    preferredName: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'The name of the assignee'
    },
    repoIntegrations: {
      description: 'The integrations that the user would probably like to use',
      type: new GraphQLNonNull(RepoIntegrationQueryPayload),
      args: {
        first: {
          type: new GraphQLNonNull(GraphQLInt),
          description: 'the number of repo integrations to return'
        },
        after: {
          type: GraphQLISO8601Type
        },
        networkOnly: {
          type: new GraphQLNonNull(GraphQLBoolean),
          description: 'true if we should fetch from the network, false if we should use the cache'
        }
      },
      resolve: async (
        {teamId, userId}: {teamId: string; userId: string},
        {first, networkOnly},
        context,
        info
      ) => {
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
        const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
        const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId, viewerId)
        const [allCachedRepoIntegrationsRes, prevUsedRepoIntegrationsRes, taskServicesWithPerms] =
          await Promise.all([
            getAllCachedRepoIntegrations(allRepoIntegrationsKey),
            getPrevUsedRepoIntegrations(prevUsedRepoIntegrationsKey),
            getTaskServicesWithPerms(dataLoader, teamId, userId)
          ])
        const [allCachedRepoIntegrations, prevUsedRepoIntegrations] =
          await updateRepoIntegrationsCacheByPerms(
            allCachedRepoIntegrationsRes,
            prevUsedRepoIntegrationsRes,
            taskServicesWithPerms,
            teamId,
            viewerId
          )
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
        removeStalePrevUsedRepoIntegrations(prevUsedRepoIntegrations, prevUsedRepoIntegrationsKey)
        const sortedRepoIntegrations = await sortRepoIntegrations(
          allRepoIntegrations,
          prevUsedRepoIntegrations
        )
        if (sortedRepoIntegrations.length > first) {
          return {hasMore: true, items: sortedRepoIntegrations.slice(0, first)}
        } else {
          return {hasMore: false, items: sortedRepoIntegrations}
        }
      }
    },
    tasks: {
      type: TaskConnection,
      description: 'Tasks owned by the team member',
      args: {
        first: {
          type: GraphQLInt
        },
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      resolve: async ({teamId, userId}, _args: unknown, {dataLoader}) => {
        const allTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        const publicTasksForUserId = allTasks.filter((task) => {
          if (task.userId !== userId) return false
          if (isTaskPrivate(task.tags)) return false
          return true
        })
        return connectionFromTasks(publicTasksForUserId)
      }
    },
    team: {
      type: Team,
      description: 'The team this team member belongs to',
      resolve: resolveTeam
    },
    teamId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key to Team table'
    },
    user: {
      type: new GraphQLNonNull(User),
      description: 'The user for the team member',
      resolve({userId}, _args: unknown, {dataLoader}) {
        return dataLoader.get('users').load(userId)
      }
    },
    userId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'foreign key to User table'
    }
  })
})

export default TeamMember
