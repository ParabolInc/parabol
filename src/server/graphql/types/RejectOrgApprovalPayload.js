import {GraphQLObjectType, GraphQLList} from 'graphql';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import OrgApproval from 'server/graphql/types/OrgApproval';

const RejectOrgApprovalPayload = new GraphQLObjectType({
  name: 'RejectOrgApprovalPayload',
  fields: () => ({
    removedRequestNotifications: {
      type: new GraphQLList(NotifyInvitation),
      description: 'The list of notifications to remove. There may be multiple if many inviters requested the same email'
    },
    removedOrgApprovals: {
      type: new GraphQLList(OrgApproval),
      description: 'The list of notifications to remove. There may be multiple if many inviters requested the same email',
      resolve: ({removedOrgApprovalIds}, args, {dataLoader}) => {
        if (!removedOrgApprovalIds) return [];
        return dataLoader.get('orgApprovals').loadMany(removedOrgApprovalIds);
      }
    }
  })
});

export default RejectOrgApprovalPayload;
