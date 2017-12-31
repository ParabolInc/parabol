import {GraphQLUnionType} from 'graphql';
import InvitationAdded from 'server/graphql/types/InvitationAdded';
import InvitationRemoved from 'server/graphql/types/InvitationRemoved';
import InvitationUpdated from 'server/graphql/types/InvitationUpdated';
import {ADDED, REMOVED, UPDATED} from 'universal/utils/constants';

const InvitationSubscriptionPayload = new GraphQLUnionType({
  name: 'InvitationSubscriptionPayload',
  types: () => [InvitationAdded, InvitationRemoved, InvitationUpdated],
  resolveType(value) {
    // type lookup needs to be resolved in a thunk since there is a circular reference when loading
    // alternative to treating it like a DB driver if GCing is an issue
    const resolveTypeLookup = {
      [ADDED]: InvitationAdded,
      [REMOVED]: InvitationRemoved,
      [UPDATED]: InvitationUpdated
    };

    return resolveTypeLookup[value.type];
  }
});
export default InvitationSubscriptionPayload;
