import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import isTaskPrivate from 'parabol-client/utils/isTaskPrivate'
import toTeamMemberId from 'parabol-client/utils/relay/toTeamMemberId'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import {
  getPermsByTaskService,
  getPrevRepoIntegrations
} from '../queries/helpers/repoIntegrationHelpers'
import {resolveTeam} from '../resolvers'
import GraphQLEmailType from './GraphQLEmailType'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import PrevRepoIntegration from './PrevRepoIntegration'
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
      type: GraphQLList(GraphQLNonNull(PrevRepoIntegration)),
      // type: GraphQLList(GraphQLNonNull(RepoIntegration)),
      // type: GraphQLList(GraphQLNonNull(RepoIntegrationQueryPayload)),
      resolve: async ({userId, teamId}, {meetingId}, {dataLoader}) => {
        const permLookup = await getPermsByTaskService(dataLoader, teamId, userId)
        const testa = await getPrevRepoIntegrations(userId, teamId, permLookup)
        // return {
        //   hasMore: false,
        //   items: [testa[0]]
        // }
        return [testa[0]]
      }
    },
    repoIntegrations: require('../queries/repoIntegrations').default,
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
