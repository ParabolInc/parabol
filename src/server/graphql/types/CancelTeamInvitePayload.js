import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveArchivedSoftTasks, resolveInvitation, resolveSoftTeamMember} from 'server/graphql/resolvers';
import Invitation from 'server/graphql/types/Invitation';
import NotifyTeamInvite from 'server/graphql/types/NotifyTeamInvite';
import {getUserId} from 'server/utils/authorization';
import Task from 'server/graphql/types/Task';
import SoftTeamMember from 'server/graphql/types/SoftTeamMember';

const CancelTeamInvitePayload = new GraphQLObjectType({
  name: 'CancelTeamInvitePayload',
  fields: () => ({
    invitation: {
      type: Invitation,
      description: 'The cancelled invitation',
      resolve: resolveInvitation
    },
    removedTeamInviteNotification: {
      type: NotifyTeamInvite,
      resolve: ({removedTeamInviteNotification}, args, {authToken}) => {
        if (!removedTeamInviteNotification) return null;
        const viewerId = getUserId(authToken);
        const notificationUserId = removedTeamInviteNotification.userIds[0];
        return notificationUserId === viewerId ? removedTeamInviteNotification : null;
      }
    },
    removedSoftTeamMember: {
      type: SoftTeamMember,
      description: 'The soft team members that are no longer tentatively on the team',
      resolve: resolveSoftTeamMember
    },
    archivedSoftTasks: {
      type: new GraphQLList(Task),
      description: 'The tasks that belonged to the soft team member',
      resolve: resolveArchivedSoftTasks
    }
  })
});

export default CancelTeamInvitePayload;
