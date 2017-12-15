import {GraphQLObjectType} from 'graphql';
import OrgApproval from 'server/graphql/types/OrgApproval';

const AddOrgApprovalPayload = new GraphQLObjectType({
  name: 'AddOrgApprovalPayload',
  fields: () => ({
    orgApproval: {
      type: OrgApproval
    }
  })
});

export default AddOrgApprovalPayload;
