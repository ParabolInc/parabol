import {GraphQLUnionType} from 'graphql';
import OrganizationAdded from 'server/graphql/types/OrganizationAdded';
import OrganizationRemoved from 'server/graphql/types/OrganizationRemoved';
import OrganizationUpdated from 'server/graphql/types/OrganizationUpdated';
import {ADDED, REMOVED, UPDATED} from 'universal/utils/constants';

const resolveTypeLookup = {
  [ADDED]: OrganizationAdded,
  [UPDATED]: OrganizationUpdated,
  [REMOVED]: OrganizationRemoved
};

const OrganizationSubscriptionPayload = new GraphQLUnionType({
  name: 'OrganizationSubscriptionPayload',
  types: () => Object.values(resolveTypeLookup),
  resolveType: ({type}) => resolveTypeLookup[type]
});

export default OrganizationSubscriptionPayload;
