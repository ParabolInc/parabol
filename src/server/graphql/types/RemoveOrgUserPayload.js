import {GraphQLInterfaceType, GraphQLList} from 'graphql';
import {
  makeResolveNotificationsForViewer,
  resolveFilterByTeam,
  resolveOrganization,
  resolveProjects,
  resolveTeamMembers,
  resolveTeams,
  resolveUser
} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';
import Project from 'server/graphql/types/Project';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';
import OrganizationMember from 'server/graphql/types/OrganizationMember';


const RemoveOrgUserPayload = new GraphQLInterfaceType({
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
  updatedProjects: {
    type: new GraphQLList(Project),
    description: 'The projects that were archived or reassigned',
    resolve: resolveFilterByTeam(resolveProjects, ({teamId}) => teamId)
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
  removedOrgMember: {
    type: OrganizationMember,
    description: 'The organization member that got removed',
    resolve: (source) => source
  }
});

export default RemoveOrgUserPayload;
