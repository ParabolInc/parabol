import {GraphQLInterfaceType, GraphQLList} from 'graphql';
import {resolveInvitations, resolveTeam, resolveTeamMember} from 'server/graphql/resolvers';
import AddTeamCreatorPayload from 'server/graphql/types/AddTeamCreatorPayload';
import AddTeamInviteePayload from 'server/graphql/types/AddTeamInviteePayload';
import Invitation from 'server/graphql/types/Invitation';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import {getUserId} from 'server/utils/authorization';

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
  }
};

const AddTeamPayload = new GraphQLInterfaceType({
  name: 'AddTeamPayload',
  resolveType: ({teamInviteNotifications}, {authToken}) => {
    const viewerId = getUserId(authToken);
    const isInvitee = Boolean(teamInviteNotifications && teamInviteNotifications.find((n) => n.userIds.includes(viewerId)));
    return isInvitee ? AddTeamInviteePayload : AddTeamCreatorPayload;
  },
  fields: () => addTeamFields
});

export default AddTeamPayload;
