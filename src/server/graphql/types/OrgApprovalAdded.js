import {GraphQLObjectType} from 'graphql';
import {resolveOrgApproval, resolveSub} from 'server/graphql/resolvers';
import OrgApproval from 'server/graphql/types/OrgApproval';
import {ADDED} from 'universal/utils/constants';

const OrgApprovalAdded = new GraphQLObjectType({
  name: 'OrgApprovalAdded',
  fields: () => ({
    orgApproval: {
      type: OrgApproval,
      resolve: resolveSub(ADDED, resolveOrgApproval)
    }
  })
});

export default OrgApprovalAdded;
