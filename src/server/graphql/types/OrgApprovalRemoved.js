import {GraphQLObjectType} from 'graphql';
import {resolveOrgApproval} from 'server/graphql/resolvers';
import OrgApproval from 'server/graphql/types/OrgApproval';

const OrgApprovalRemoved = new GraphQLObjectType({
  name: 'OrgApprovalRemoved',
  fields: () => ({
    orgApproval: {
      type: OrgApproval,
      resolve: resolveOrgApproval
    }
  })
});

export default OrgApprovalRemoved;
