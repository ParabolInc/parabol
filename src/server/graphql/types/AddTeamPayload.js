import {GraphQLObjectType, GraphQLList} from 'graphql';
import {
  makeResolveNotificationForViewer, resolveInvitations, resolveTeam,
  resolveTeamMember
} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';

export const addTeamFields = {
  team: {
    type: Team,
    resolve: resolveTeam
  },
  teamMember: {
    type: TeamMember,
    description: 'The teamMember that just created the new team, if this is a creation',
    resolve: resolveTeamMember
  },
  invitations: {
    type: new GraphQLList(Invitation),
    resolve: resolveInvitations
  },
  teamInviteNotification: {
    type: NotifyTeamInvite,
    description: 'The invitation sent when an team was being created',
    resolve: makeResolveNotificationForViewer('-', 'teamInviteNotifications')
  }
};

const AddTeamPayload = new GraphQLObjectType({
  name: 'AddTeamPayload',
  fields: () => addTeamFields
});

export default AddTeamPayload;
