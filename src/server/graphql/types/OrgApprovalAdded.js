import {GraphQLObjectType} from 'graphql';
import {resolveOrgApproval} from 'server/graphql/resolvers';
import OrgApproval from 'server/graphql/types/OrgApproval';

const OrgApprovalAdded = new GraphQLObjectType({
  name: 'OrgApprovalAdded',
  fields: () => ({
    orgApproval: {
      type: OrgApproval,
      resolve: resolveOrgApproval
    }
  })
});

export default OrgApprovalAdded;
