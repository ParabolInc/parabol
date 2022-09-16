import {GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString} from 'graphql'
import {getUserId} from '../../utils/authorization'
import errorFilter from '../errorFilter'
import {GQLContext} from '../graphql'
import {
  resolveFilterByTeam,
  resolveOrganization,
  resolveTasks,
  resolveTeamMembers,
  resolveTeams,
  resolveUser
} from '../resolvers'
import NotifyKickedOut from './NotifyKickedOut'
import Organization from './Organization'
import OrganizationUser from './OrganizationUser'
import StandardMutationError from './StandardMutationError'
import Task from './Task'
import Team from './Team'
import TeamMember from './TeamMember'
import User from './User'

const RemoveOrgUserPayload = new GraphQLObjectType<any, GQLContext>({
  name: 'RemoveOrgUserPayload',
  fields: () => ({
    error: {
      type: StandardMutationError
    },
    organization: {
      type: Organization,
      resolve: resolveOrganization,
      description: 'The organization the user was removed from'
    },
    teams: {
      type: new GraphQLList(new GraphQLNonNull(Team)),
      description: 'The teams the user was removed from',
      resolve: resolveFilterByTeam(resolveTeams as any, ({id}) => id)
    },
    teamMembers: {
      type: new GraphQLList(new GraphQLNonNull(TeamMember)),
      description: 'The teamMembers removed',
      resolve: resolveFilterByTeam(resolveTeamMembers as any, ({teamId}) => teamId)
    },
    updatedTasks: {
      type: new GraphQLList(new GraphQLNonNull(Task)),
      description: 'The tasks that were archived or reassigned',
      resolve: resolveFilterByTeam(resolveTasks, ({teamId}) => teamId)
    },
    user: {
      type: User,
      description: 'The user removed from the organization',
      resolve: resolveUser
    },
    kickOutNotifications: {
      type: new GraphQLList(new GraphQLNonNull(NotifyKickedOut)),
      description: 'The notifications for each team the user was kicked out of',
      resolve: async ({kickOutNotificationIds}, _args: unknown, {authToken, dataLoader}) => {
        if (!kickOutNotificationIds) return null
        const viewerId = getUserId(authToken)
        const notifications = (
          await dataLoader.get('notifications').loadMany(kickOutNotificationIds)
        ).filter(errorFilter)
        return notifications.filter((notification) => notification.userId === viewerId)
      }
    },
    removedOrgMember: {
      type: OrganizationUser,
      description: 'The organization member that got removed',
      resolve: async ({organizationUserId}, _args: unknown, {dataLoader}) => {
        return dataLoader.get('organizationUsers').load(organizationUserId)
      }
    },
    organizationUserId: {
      type: GraphQLString
    }
  })
})

export default RemoveOrgUserPayload
