import {GraphQLInterfaceType} from 'graphql';
import {resolveTeam} from 'server/graphql/resolvers';
import InviteTeamMembersAnnouncePayload from 'server/graphql/types/InviteTeamMembersAnnoucePayload';
import InviteTeamMembersInviteePayload from 'server/graphql/types/InviteTeamMembersInviteePayload';
import InviteTeamMembersOrgLeaderPayload from 'server/graphql/types/InviteTeamMembersOrgLeaderPayload';
import Team from 'server/graphql/types/Team';
import {getUserId} from 'server/utils/authorization';
import fromTeamMemberId from 'universal/utils/relay/fromTeamMemberId';


export const inviteTeamMembersFields = {
  team: {
    type: Team,
    description: 'The team the inviter is inviting the invitee to',
    resolve: resolveTeam
  }
};

const InviteTeamMembersPayload = new GraphQLInterfaceType({
  name: 'InviteTeamMembersPayload',
  description: 'A list of all the possible outcomes when trying to invite a team member',
  resolveType: (value, {authToken}) => {
    const viewerId = getUserId(authToken);
    const {reactivatedTeamMemberIds, inviteNotifications, requestNotifications, removedRequestNotifications} = value;
    const isViewerReactivated = Boolean(reactivatedTeamMemberIds.find((teamMemberId) => {
      const {userId} = fromTeamMemberId(teamMemberId);
      return userId === viewerId;
    }));
    const isViewerInvited = Boolean(inviteNotifications.find(({userIds}) => userIds.includes(viewerId)));
    if (isViewerReactivated || isViewerInvited) {
      return InviteTeamMembersInviteePayload;
    }
    if ((removedRequestNotifications.concat(requestNotifications).find((n) => n.userIds.includes(viewerId)))) {
      return InviteTeamMembersOrgLeaderPayload;
    }
    return InviteTeamMembersAnnouncePayload;
  },
  fields: () => inviteTeamMembersFields
});

export default InviteTeamMembersPayload;
