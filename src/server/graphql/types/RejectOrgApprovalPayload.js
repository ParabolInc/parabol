import {GraphQLObjectType, GraphQLList} from 'graphql';
import NotifyInvitation from 'server/graphql/types/NotifyInvitation';
import OrgApproval from 'server/graphql/types/OrgApproval';

const RejectOrgApprovalPayload = new GraphQLObjectType({
  name: 'RejectOrgApprovalPayload',
  fields: () => ({
    notifications: {
      type: new GraphQLList(NotifyInvitation),
      description: 'The list of notifications to remove. There may be multiple if many inviters requested the same email'
    },
    orgApprovals: {
      type: new GraphQLList(OrgApproval),
      description: 'The list of notifications to remove. There may be multiple if many inviters requested the same email'
    }
  })
});

export default RejectOrgApprovalPayload;
