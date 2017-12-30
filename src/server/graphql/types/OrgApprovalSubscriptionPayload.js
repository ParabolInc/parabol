import {GraphQLUnionType} from 'graphql';
import OrgApprovalAdded from 'server/graphql/types/OrgApprovalAdded';
import OrgApprovalRemoved from 'server/graphql/types/OrgApprovalRemoved';
import TeamUpdated from 'server/graphql/types/TeamUpdated';
import {ADDED, REMOVED} from 'universal/utils/constants';

const OrgApprovalSubscriptionPayload = new GraphQLUnionType({
  name: 'OrgApprovalSubscriptionPayload',
  types: () => [OrgApprovalAdded, TeamUpdated, OrgApprovalRemoved],
  resolveType(value) {
    // type lookup needs to be resolved in a thunk since there is a circular reference when loading
    // alternative to treating it like a DB driver if GCing is an issue
    const resolveTypeLookup = {
      [ADDED]: OrgApprovalAdded,
      [REMOVED]: OrgApprovalRemoved
    };

    return resolveTypeLookup[value.type];
  }
});
export default OrgApprovalSubscriptionPayload;
