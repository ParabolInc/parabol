import {GraphQLObjectType, GraphQLList} from 'graphql';
import NotifyRequestNewUser from 'server/graphql/types/NotifyRequestNewUser';
import OrgApproval from 'server/graphql/types/OrgApproval';

const RejectOrgApprovalPayload = new GraphQLObjectType({
  name: 'RejectOrgApprovalPayload',
  fields: () => ({
    removedRequestNotifications: {
      type: new GraphQLList(NotifyRequestNewUser),
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
