import {GraphQLInterfaceType, GraphQLList} from 'graphql';
import {
  resolveIfViewer,
  resolveInvitation,
  resolveProjects,
  resolveSoftTeamMember,
  resolveTeam,
  resolveTeamMember,
  resolveUser
} from 'server/graphql/resolvers';
import AcceptTeamInviteEmailPayload from 'server/graphql/types/AcceptTeamInviteEmailPayload';
import AcceptTeamInviteNotificationPayload from 'server/graphql/types/AcceptTeamInviteNotificationPayload';
import Invitation from 'server/graphql/types/Invitation';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';
import SoftTeamMember from 'server/graphql/types/SoftTeamMember';
import Project from 'server/graphql/types/Project';

export const acceptTeamInviteFields = {
  team: {
    type: Team,
    description: 'The team that the invitee will be joining',
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
    resolve: resolveIfViewer('removedNotification')
  },
  removedInvitation: {
    type: Invitation,
    resolve: resolveInvitation,
    description: 'The invitation the viewer just accepted'
  },
  user: {
    type: User,
    resolve: resolveUser
  },
  removedSoftTeamMember: {
    type: SoftTeamMember,
    description: 'The soft team member that got promoted to a real team member',
    resolve: resolveSoftTeamMember
  },
  hardenedProjects: {
    type: new GraphQLList(Project),
    description: 'The projects that got reassigned from the soft team member to the real team member',
    resolve: resolveProjects
  }
};

const AcceptTeamInvitePayload = new GraphQLInterfaceType({
  name: 'AcceptTeamInvitePayload',
  fields: acceptTeamInviteFields,
  resolveType: ({authToken}) => authToken ? AcceptTeamInviteEmailPayload : AcceptTeamInviteNotificationPayload
});

export default AcceptTeamInvitePayload;
