import {GraphQLList, GraphQLObjectType} from 'graphql';
import {
  makeResolveNotificationsForViewer,
  resolveArchivedSoftTasks,
  resolveSoftTeamMembers
} from 'server/graphql/resolvers';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import OrgApproval from 'server/graphql/types/OrgApproval';
import {getUserId} from 'server/utils/authorization';
import SoftTeamMember from 'server/graphql/types/SoftTeamMember';
import Task from 'server/graphql/types/Task';

const RejectOrgApprovalPayload = new GraphQLObjectType({
  name: 'RejectOrgApprovalPayload',
  fields: () => ({
    removedOrgApprovals: {
      type: new GraphQLList(OrgApproval),
      description: 'The list of org approvals to remove. There may be multiple if many inviters requested the same email',
      resolve: ({removedOrgApprovalIds}, args, {dataLoader}) => {
        if (!removedOrgApprovalIds || removedOrgApprovalIds.length === 0) return null;
        return dataLoader.get('orgApprovals').loadMany(removedOrgApprovalIds);
      }
    },
    deniedNotifications: {
      type: new GraphQLList(NotifyDenial),
      description: 'The notification going to the inviter saying their invitee has been denied',
      resolve: makeResolveNotificationsForViewer('deniedNotificationIds')
    },
    removedRequestNotifications: {
      type: new GraphQLList(NotifyRequestNewUser),
      description: 'The list of notifications to remove. There may be multiple if many inviters requested the same email',
      resolve: ({removedRequestNotifications}, args, {authToken}) => {
        const viewerId = getUserId(authToken);
        if (!removedRequestNotifications || removedRequestNotifications.length === 0) return null;
        return removedRequestNotifications.filter(({userIds}) => userIds.includes(viewerId));
      }
    },
    removedSoftTeamMembers: {
      type: new GraphQLList(SoftTeamMember),
      description: 'The soft team members that have not yet been invited',
      resolve: resolveSoftTeamMembers
    },
    archivedSoftTasks: {
      type: new GraphQLList(Task),
      description: 'The tasks that belonged to the soft team member',
      resolve: resolveArchivedSoftTasks
    }
  })
});

export default RejectOrgApprovalPayload;
