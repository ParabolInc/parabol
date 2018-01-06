import {GraphQLObjectType} from 'graphql';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import {rejectOrgApprovalFields} from 'server/graphql/types/RejectOrgApprovalPayload';
import {getUserId} from 'server/utils/authorization';

const RejectOrgApprovalOrgLeaderPayload = new GraphQLObjectType({
  name: 'RejectOrgApprovalOrgLeaderPayload',
  interfaces: () => [RejectOrgApprovalPayload],
  fields: () => ({
    ...rejectOrgApprovalFields,
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

export default RejectOrgApprovalOrgLeaderPayload;
