import {GraphQLList, GraphQLInterfaceType} from 'graphql';
import {resolveInvitations, resolveOrganization, resolveTeam, resolveTeamMember} from 'server/graphql/resolvers';
import AddOrgCreatorPayload from 'server/graphql/types/AddOrgCreatorPayload';
import AddOrgInviteePayload from 'server/graphql/types/AddOrgInviteePayload';
import Invitation from 'server/graphql/types/Invitation';
import Organization from 'server/graphql/types/Organization';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import {getUserId} from 'server/utils/authorization';

export const addOrgFields = {
  organization: {
    type: Organization,
    resolve: resolveOrganization
  },
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

const AddOrgPayload = new GraphQLInterfaceType({
  name: 'AddOrgPayload',
  resolveType: ({teamInviteNotifications}, {authToken}) => {
    const viewerId = getUserId(authToken);
    const isInvitee = Boolean(teamInviteNotifications && teamInviteNotifications.find((n) => n.userIds.includes(viewerId)));
    return isInvitee ? AddOrgInviteePayload : AddOrgCreatorPayload;
  },
  fields: () => addOrgFields
});

export default AddOrgPayload;
