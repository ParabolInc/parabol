import {GraphQLObjectType, GraphQLList} from 'graphql';
import {
  makeResolveNotificationsForViewer,
  resolveFilterByTeam,
  resolveOrganization,
  resolveTasks,
  resolveTeamMembers,
  resolveTeams,
  resolveUser
} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';
import Task from 'server/graphql/types/Task';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';
import OrganizationMember from 'server/graphql/types/OrganizationMember';
import Notification from 'server/graphql/types/Notification';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';

const RemoveOrgUserPayload = new GraphQLObjectType({
  name: 'RemoveOrgUserPayload',
  fields: () => ({
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
      type: OrganizationMember,
      description: 'The organization member that got removed',
      resolve: (source) => source
    }
  })
});

export default RemoveOrgUserPayload;
