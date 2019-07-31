import {GraphQLObjectType, GraphQLList, GraphQLString} from 'graphql'
import {
  makeResolveNotificationsForViewer,
  resolveFilterByTeam,
  resolveOrganization,
  resolveTasks,
  resolveTeamMembers,
  resolveTeams,
  resolveUser
} from '../resolvers'
import Organization from './Organization'
import Task from './Task'
import Team from './Team'
import TeamMember from './TeamMember'
import User from './User'
import Notification from './Notification'
import NotifyKickedOut from './NotifyKickedOut'
import StandardMutationError from './StandardMutationError'
import OrganizationUser from './OrganizationUser'

const RemoveOrgUserPayload = new GraphQLObjectType({
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
      type: new GraphQLList(Team),
      description: 'The teams the user was removed from',
      resolve: resolveFilterByTeam(resolveTeams, ({id}) => id)
    },
    teamMembers: {
      type: new GraphQLList(TeamMember),
      description: 'The teamMembers removed',
      resolve: resolveFilterByTeam(resolveTeamMembers, ({teamId}) => teamId)
    },
    updatedTasks: {
      type: new GraphQLList(Task),
      description: 'The tasks that were archived or reassigned',
      resolve: resolveFilterByTeam(resolveTasks, ({teamId}) => teamId)
    },
    user: {
      type: User,
      description: 'The user removed from the organization',
      resolve: resolveUser
    },
    removedTeamNotifications: {
      type: new GraphQLList(Notification),
      description: 'The notifications relating to a team the user was removed from',
      resolve: resolveFilterByTeam(
        makeResolveNotificationsForViewer('', 'removedTeamNotifications'),
        ({teamId}) => teamId
      )
    },
    removedOrgNotifications: {
      type: new GraphQLList(Notification),
      description: 'The notifications that are no longer relevant to the removed org user',
      resolve: makeResolveNotificationsForViewer('', 'removedOrgNotifications')
    },
    kickOutNotifications: {
      type: new GraphQLList(NotifyKickedOut),
      description: 'The notifications for each team the user was kicked out of',
      resolve: makeResolveNotificationsForViewer('kickOutNotificationIds', '')
    },
    removedOrgMember: {
      type: OrganizationUser,
      description: 'The organization member that got removed',
      resolve: async ({organizationUserId}, _args, {dataLoader}) => {
        return dataLoader.get('organizationUsers').load(organizationUserId)
      }
    },
    organizationUserId: {
      type: GraphQLString
    }
  })
})

export default RemoveOrgUserPayload
