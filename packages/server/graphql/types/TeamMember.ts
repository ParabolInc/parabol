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
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import {resolveTeam} from '../resolvers'
import GraphQLEmailType from './GraphQLEmailType'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import SlackAuth from './SlackAuth'
import SlackNotification from './SlackNotification'
import {TaskConnection} from './Task'
import Team from './Team'
import User from './User'

const TeamMember = new GraphQLObjectType<any, GQLContext, any>({
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
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    hideAgenda: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'hide the agenda list on the dashboard',
      resolve: ({hideAgenda}) => !!hideAgenda
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
    /* Ephemeral meeting state */
    checkInOrder: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The place in line for checkIn, regenerated every meeting'
    },
    isSelf: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'true if this team member belongs to the user that queried it',
      resolve: (source, _args, {authToken}) => {
        const userId = getUserId(authToken)
        return source.userId === userId
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
    slackAuth: {
      type: SlackAuth,
      description: 'The slack auth for the team member.',
      resolve: async ({userId, teamId}, _args, {dataLoader}) => {
        const auths = await dataLoader.get('slackAuthByUserId').load(userId)
        return auths.find((auth) => auth.teamId === teamId)
      }
    },
    slackNotifications: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SlackNotification))),
      description: 'A list of events and the slack channels they get posted to',
      resolve: async ({userId, teamId}, _args, {dataLoader}) => {
        const slackNotifications = await dataLoader.get('slackNotificationsByTeamId').load(teamId)
        return slackNotifications.filter((notification) => notification.userId === userId)
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
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
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
      resolve({userId}, _args, {dataLoader}) {
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
