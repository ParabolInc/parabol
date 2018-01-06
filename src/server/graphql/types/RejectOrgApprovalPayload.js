import {GraphQLInterfaceType, GraphQLList} from 'graphql';
import OrgApproval from 'server/graphql/types/OrgApproval';
import RejectOrgApprovalInviterPayload from 'server/graphql/types/RejectOrgApprovalInviterPayload';
import RejectOrgApprovalOrgLeaderPayload from 'server/graphql/types/RejectOrgApprovalOrgLeaderPayload';
import {getUserId} from 'server/utils/authorization';

export const rejectOrgApprovalFields = {
  removedOrgApprovals: {
    type: new GraphQLList(OrgApproval),
    description: 'The list of org approvals to remove. There may be multiple if many inviters requested the same email',
    resolve: ({removedOrgApprovalIds}, args, {dataLoader}) => {
      if (!removedOrgApprovalIds || removedOrgApprovalIds.length === 0) return null;
      return dataLoader.get('orgApprovals').loadMany(removedOrgApprovalIds);
    }
  }
};

const RejectOrgApprovalPayload = new GraphQLInterfaceType({
  name: 'RejectOrgApprovalPayload',
  resolveType: ({deniedNotifications}, {authToken}) => {
    const viewerId = getUserId(authToken);
    const isInviter = Boolean(deniedNotifications.find((n) => n.userIds.includes(viewerId)));
    return isInviter ? RejectOrgApprovalInviterPayload : RejectOrgApprovalOrgLeaderPayload;
  },
  fields: () => ({
    ...rejectOrgApprovalFields
  })
});

export default RejectOrgApprovalPayload;
