import {GraphQLInterfaceType, GraphQLList} from 'graphql';
import {
  resolveNotification, resolveProjects, resolveTeam, resolveTeamMember, resolveTypeForViewer,
  resolveUser
} from 'server/graphql/resolvers';
import NotifyKickedOut from 'server/graphql/types/NotifyKickedOut';
import Project from 'server/graphql/types/Project';
import RemoveTeamMemberOtherPayload from 'server/graphql/types/RemoveTeamMemberOtherPayload';
import RemoveTeamMemberSelfPayload from 'server/graphql/types/RemoveTeamMemberSelfPayload';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';


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
  notification: {
    type: NotifyKickedOut,
    description: 'A notification if you were kicked out by the team leader',
    resolve: resolveNotification
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
  resolveType: resolveTypeForViewer(RemoveTeamMemberSelfPayload, RemoveTeamMemberOtherPayload)
});

export default RemoveTeamMemberPayload;
