import {GraphQLUnionType} from 'graphql';
import TeamAdded from 'server/graphql/types/TeamAdded';
import TeamRemoved from 'server/graphql/types/TeamRemoved';
import TeamUpdated from 'server/graphql/types/TeamUpdated';
import {ADDED, REMOVED, UPDATED} from 'universal/utils/constants';

const TeamSubscriptionPayload = new GraphQLUnionType({
  name: 'TeamSubscriptionPayload',
  types: () => [TeamAdded, TeamUpdated, TeamRemoved],
  resolveType(value) {
    // type lookup needs to be resolved in a thunk since there is a circular reference when loading
    // alternative to treating it like a DB driver if GCing is an issue
    const resolveTypeLookup = {
      [ADDED]: TeamAdded,
      [UPDATED]: TeamUpdated,
      [REMOVED]: TeamRemoved
    };

    return resolveTypeLookup[value.type];
  }
});
export default TeamSubscriptionPayload;
