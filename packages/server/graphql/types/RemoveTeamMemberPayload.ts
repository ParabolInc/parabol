import {GraphQLList, GraphQLNonNull, GraphQLObjectType} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {GQLContext} from '../graphql'
import {resolveTasks, resolveTeam, resolveTeamMember, resolveUser} from '../resolvers'
import StandardMutationError from './StandardMutationError'
import Task from './Task'
import Team from './Team'
import TeamMember from './TeamMember'
import User from './User'

const RemoveTeamMemberPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveTeamMemberPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    teamMember: {
      type: TeamMember,
      description: 'The team member removed',
      resolve: resolveTeamMember
    },
    team: {
      type: Team,
      description: 'The team the team member was removed from',
      resolve: resolveTeam
    },
    updatedTasks: {
      type: new GraphQLList(new GraphQLNonNull(Task)),
      description: 'The tasks that got reassigned',
      resolve: resolveTasks
    },
    user: {
      type: User,
      description: 'The user removed from the team',
      resolve: resolveUser
    },
    kickOutNotification: {
      type: new GraphQLObjectType({
        name: 'NotifyKickedOut',
        fields: {}
      }),
      description: 'A notification if you were kicked out by the team leader',
      resolve: async ({notificationId}, _args: unknown, {authToken, dataLoader}) => {
        if (!notificationId) return null
        const viewerId = getUserId(authToken)
        const notification = await dataLoader.get('notifications').load(notificationId)
        return notification.userId === viewerId ? notification : null
      }
    }
  })
})

export default RemoveTeamMemberPayload
