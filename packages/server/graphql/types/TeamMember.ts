import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} from 'graphql'
import {forwardConnectionArgs} from 'graphql-relay'
import connectionFromTasks from '../queries/helpers/connectionFromTasks'
import {resolveTeam} from '../resolvers'
import GraphQLEmailType from './GraphQLEmailType'
import GraphQLISO8601Type from './GraphQLISO8601Type'
import GraphQLURLType from './GraphQLURLType'
import {TaskConnection} from './Task'
import Team from './Team'
import User from './User'
import {getUserId} from '../../utils/authorization'
import toTeamMemberId from '../../../client/utils/relay/toTeamMemberId'
import SlackAuth from './SlackAuth'
import SlackNotification from './SlackNotification'

const TeamMember = new GraphQLObjectType({
  name: 'TeamMember',
  description: 'A member of a team',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'An ID for the teamMember. userId::teamId'
    },
    isNotRemoved: {
      type: GraphQLBoolean,
      description: 'true if the user is a part of the team, false if they no longer are'
    },
    isLead: {type: GraphQLBoolean, description: 'Is user a team lead?'},
    isFacilitator: {
      type: GraphQLBoolean,
      description: 'Is user a team facilitator?'
    },
    hideAgenda: {
      type: GraphQLBoolean,
      description: 'hide the agenda list on the dashboard'
    },
    /* denormalized from User */
    email: {
      type: new GraphQLNonNull(GraphQLEmailType),
      description: 'The user email'
    },
    picture: {
      type: GraphQLURLType,
      description: 'url of user’s profile picture'
    },
    /* Ephemeral meeting state */
    checkInOrder: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'The place in line for checkIn, regenerated every meeting'
    },
    isConnected: {
      type: GraphQLBoolean,
      description: 'true if the user is connected',
      resolve: async (source, _args, {dataLoader}) => {
        if (source.hasOwnProperty('isConnected')) {
          return source.isConnected
        }
        const {userId} = source
        if (userId) {
          const {connectedSockets} = await dataLoader.get('users').load(userId)
          return Array.isArray(connectedSockets) && connectedSockets.length > 0
        }
        // should only hit this in dev
        return false
      }
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
          type: GraphQLID
        }
      },
      resolve: async ({teamId, userId}, args, {dataLoader}) => {
        let meetingId = args.meetingId
        if (!meetingId) {
          const team = await dataLoader.get('teams').load(teamId)
          meetingId = team.meetingId
        }
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
        ...forwardConnectionArgs,
        after: {
          type: GraphQLISO8601Type,
          description: 'the datetime cursor'
        }
      },
      resolve: async ({teamId, userId}, _args, {dataLoader}) => {
        const allTasks = await dataLoader.get('tasksByTeamId').load(teamId)
        const tasksForUserId = allTasks.filter((task) => task.userId === userId)
        const publicTasksForUserId = tasksForUserId.filter((task) => !task.tags.includes('private'))
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
      resolve ({userId}, _args, {dataLoader}) {
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
