import {GraphQLObjectType} from 'graphql';
import {resolveOrgApproval, resolveSub} from 'server/graphql/resolvers';
import OrgApproval from 'server/graphql/types/OrgApproval';
import {REMOVED} from 'universal/utils/constants';

const OrgApprovalRemoved = new GraphQLObjectType({
  name: 'OrgApprovalRemoved',
  fields: () => ({
    orgApproval: {
      type: OrgApproval,
      resolve: resolveSub(REMOVED, resolveOrgApproval)
    }
  })
});

export default OrgApprovalRemoved;
