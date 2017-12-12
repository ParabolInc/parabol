import {GraphQLObjectType} from 'graphql';
import OrgApproval from 'server/graphql/types/OrgApproval';

const CancelApprovalPayload = new GraphQLObjectType({
  name: 'CancelApprovalPayload',
  fields: () => ({
    orgApproval: {
      type: OrgApproval
    }
  })
});

export default CancelApprovalPayload;
