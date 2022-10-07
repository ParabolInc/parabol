import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
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
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import fetchAllRepoIntegrations from '../queries/helpers/fetchAllRepoIntegrations'
import getCachedRepoIntegrations from '../queries/helpers/getCachedRepoIntegrations'
import {resolveTeam} from '../resolvers'
import GraphQLEmailType from './GraphQLEmailType'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import RepoIntegration from './RepoIntegration'
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
    allAvailableRepoIntegrations: require('../queries/allAvailableRepoIntegrations').default,
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
    prevRepoIntegrations: {
      description: 'The integrations that the user has previously used',
      type: new GraphQLList(new GraphQLNonNull(RepoIntegration)),
      resolve: async ({teamId}: {teamId: string; userId: string}, _args, {dataLoader}) => {
        const redis = getRedis()
        const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId)
        const prevUsedRepoIntegrationsKey = getPrevUsedRepoIntegrationsRedisKey(teamId)
        const [allRepoIntegrationsRes] = await Promise.all([redis.get(allRepoIntegrationsKey)])
        if (!allRepoIntegrationsRes) return []
        return []
      }
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
        }
      },
      resolve: async (
        {teamId, userId}: {teamId: string; userId: string},
        {first},
        context,
        info
      ) => {
        const ignoreCache = false // TODO: make an arg

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

        if (ignoreCache) {
          const allRepoIntegrations = await fetchAllRepoIntegrations(teamId, userId, context, info)
          // console.log('🚀 ~ allRepoIntegrations', allRepoIntegrations)

          const redis = getRedis()
          const allRepoIntegrationsKey = getAllRepoIntegrationsRedisKey(teamId)
          const allRepoIntegrationsStr = JSON.stringify(allRepoIntegrations)
          redis.set(allRepoIntegrationsKey, allRepoIntegrationsStr, 'PX', ms('90d'))

          if (allRepoIntegrations.length > first) {
            return {hasMore: true, items: allRepoIntegrations.slice(0, first)}
          } else {
            return {hasMore: false, items: allRepoIntegrations}
          }
        } else {
          const cachedRepoIntegrations = await getCachedRepoIntegrations(teamId)

          if (cachedRepoIntegrations.length > first) {
            return {hasMore: true, items: cachedRepoIntegrations.slice(0, first)}
          } else {
            return {hasMore: false, items: cachedRepoIntegrations}
          }
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
