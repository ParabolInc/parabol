import {GraphQLUnionType} from 'graphql';
import TeamMemberAdded from 'server/graphql/types/TeamMemberAdded';
import TeamMemberUpdated from 'server/graphql/types/TeamMemberUpdated';
import {ADDED, UPDATED} from 'universal/utils/constants';

const TeanMemberSubscriptionPayload = new GraphQLUnionType({
  name: 'TeanMemberSubscriptionPayload',
  // fields: () => teamMemberSubPayloadInterfaceFields,
  types: () => [TeamMemberAdded, TeamMemberUpdated],
  resolveType(value) {
    // type lookup needs to be resolved in a thunk since there is a circular reference when loading
    // alternative to treating it like a DB driver if GCing is an issue
    const resolveTypeLookup = {
      [ADDED]: TeamMemberAdded,
      [UPDATED]: TeamMemberUpdated
      // [REMOVED]: TeamMemberRemoved
    };

    return resolveTypeLookup[value.type];
  }
});
export default TeanMemberSubscriptionPayload;
