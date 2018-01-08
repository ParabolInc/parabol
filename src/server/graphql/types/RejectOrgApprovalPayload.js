import {GraphQLList, GraphQLObjectType} from 'graphql';
import {resolveNotificationForViewer} from 'server/graphql/resolvers';
import NotifyDenial from 'server/graphql/types/NotifyDenial';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import OrgApproval from 'server/graphql/types/OrgApproval';
import {getUserId} from 'server/utils/authorization';

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
    deniedNotification: {
      type: NotifyDenial,
      description: 'The notification going to the inviter saying their invitee has been denied',
      resolve: resolveNotificationForViewer
    },
    removedRequestNotifications: {
      type: new GraphQLList(NotifyRequestNewUser),
      description: 'The list of notifications to remove. There may be multiple if many inviters requested the same email',
      resolve: ({removedRequestNotifications}, args, {authToken}) => {
        const viewerId = getUserId(authToken);
        if (!removedRequestNotifications || removedRequestNotifications.length === 0) return null;
        return removedRequestNotifications.filter(({userIds}) => userIds.includes(viewerId));
      }
    }
  })
});

export default RejectOrgApprovalPayload;
