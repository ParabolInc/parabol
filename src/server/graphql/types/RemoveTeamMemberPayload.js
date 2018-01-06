import {GraphQLInterfaceType, GraphQLList} from 'graphql';
import {resolveProjects, resolveTeam, resolveTeamMember, resolveUser} from 'server/graphql/resolvers';
import Project from 'server/graphql/types/Project';
import RemoveTeamMemberExMemberPayload from 'server/graphql/types/RemoveTeamMemberExMemberPayload';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';
import {getUserId} from 'server/utils/authorization';


export const removeTeamMemberFields = {
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
  updatedProjects: {
    type: new GraphQLList(Project),
    description: 'The projects that got reassigned',
    resolve: resolveProjects
  },
  user: {
    type: User,
    description: 'The user removed from the team',
    resolve: resolveUser
  }
};

const RemoveTeamMemberPayload = new GraphQLInterfaceType({
  name: 'RemoveTeamMemberPayload',
  fields: () => removeTeamMemberFields,
  resolveType: ({userId}, {authToken}) => {
    const viewerId = getUserId(authToken);
    return viewerId === userId ? RemoveTeamMemberExMemberPayload : RemoveTeamMemberOtherPayload;
  }
});

export default RemoveTeamMemberPayload;
