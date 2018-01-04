import {GraphQLInterfaceType} from 'graphql';
import {resolveInvitation, resolveTeam, resolveTeamMember, resolveUser} from 'server/graphql/resolvers';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import Invitation from 'server/graphql/types/Invitation';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';

export const acceptTeamInviteFields = {
  team: {
    type: Team,
    description: 'Thea team that the invitee will be joining',
    resolve: resolveTeam
  },
  teamMember: {
    type: TeamMember,
    description: 'The new team member on the team',
    resolve: resolveTeamMember
  },
  removedNotification: {
    type: NotifyTeamInvite,
    description: 'The invite notification removed once accepted',
    resolve: ({removedNotification, userId}, args, {authToken}) => {
      return userId === getUserId(authToken) ? removedNotification : undefined;
    }
  },
  removedInvitation: {
    type: Invitation,
    resolve: resolveInvitation,
    description: 'The invitation the viewer just accepted'
  },
  user: {
    type: User,
    resolve: resolveUser
  }
};

const AcceptTeamInvitePayload = new GraphQLInterfaceType({
  name: 'AcceptTeamInvitePayload',
  fields: acceptTeamInviteFields,
  resolveType: ({authToken}) => authToken ? AcceptTeamInviteEmailPayload : AcceptTeamInviteNotificationPayload
});

export default AcceptTeamInvitePayload;
