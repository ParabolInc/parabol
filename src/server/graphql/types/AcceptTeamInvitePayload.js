import {GraphQLID, GraphQLList, GraphQLObjectType} from 'graphql';
import {
  resolveIfViewer,
  resolveInvitation,
  resolveSoftTeamMember,
  resolveTasks,
  resolveTeam,
  resolveTeamMember,
  resolveUser
} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';
import Team from 'server/graphql/types/Team';
import TeamMember from 'server/graphql/types/TeamMember';
import User from 'server/graphql/types/User';
import SoftTeamMember from 'server/graphql/types/SoftTeamMember';
import Task from 'server/graphql/types/Task';
import StandardMutationError from 'server/graphql/types/StandardMutationError';

const AcceptTeamInvitePayload = new GraphQLObjectType({
  name: 'AcceptTeamInvitePayload',
  fields: () => ({
    authToken: {
      type: GraphQLID,
      description: 'The new JWT'
    },
    error: {
      type: StandardMutationError
    },
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
    hardenedTasks: {
      type: new GraphQLList(Task),
      description:
        'The tasks that got reassigned from the soft team member to the real team member',
      resolve: resolveTasks
    }
  })
});

export default AcceptTeamInvitePayload;
