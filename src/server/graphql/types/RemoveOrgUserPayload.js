import {GraphQLInterfaceType, GraphQLList} from 'graphql';
import {
  resolveOrganization, resolveProjects, resolveTeamMembers, resolveTeams, resolveTypeForViewer,
  resolveUser
} from 'server/graphql/resolvers';
import Organization from 'server/graphql/types/Organization';
import Project from 'server/graphql/types/Project';
import RemoveOrgUserOtherPayload from 'server/graphql/types/RemoveOrgUserOtherPayload';
import RemoveOrgUserSelfPayload from 'server/graphql/types/RemoveOrgUserSelfPayload';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';


export const removeOrgUserFields = {
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
  }
};

const RemoveOrgUserPayload = new GraphQLInterfaceType({
  name: 'RemoveOrgUserPayload',
  fields: () => removeOrgUserFields,
  resolveType: resolveTypeForViewer(RemoveOrgUserSelfPayload, RemoveOrgUserOtherPayload)
});

export default RemoveOrgUserPayload;
