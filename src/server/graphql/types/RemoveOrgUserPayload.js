import {GraphQLInterfaceType, GraphQLList} from 'graphql';
import {
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


const RemoveOrgUserPayload = new GraphQLInterfaceType({
  organization: {
    type: Organization,
    resolve: resolveOrganization,
    description: 'The organization the user was removed from'
  },
  teams: {
    type: new GraphQLList(Team),
    description: 'The teams the user was removed from',
    resolve: resolveTeams
  },
  teamMembers: {
    type: new GraphQLList(TeamMember),
    description: 'The teamMembers removed',
    resolve: resolveTeamMembers
  },
  updatedProjects: {
    type: new GraphQLList(Project),
    description: 'The projects that were archived or reassigned',
    resolve: resolveProjects
  },
  user: {
    type: User,
    description: 'The user removed from the organization',
    resolve: resolveUser
  },
  removedNotifications: {
    type: new GraphQLList(Notification),
    description: 'The notifications that are no longer relevant'
  }
});

export default RemoveOrgUserPayload;
