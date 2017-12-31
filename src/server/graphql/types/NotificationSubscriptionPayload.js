import {GraphQLUnionType} from 'graphql';
import NotificationAdded from 'server/graphql/types/NotificationAdded';
import NotificationRemoved from 'server/graphql/types/NotificationRemoved';
import {ADDED, REMOVED} from 'universal/utils/constants';

const resolveTypeLookup = {
  [ADDED]: NotificationAdded,
  [REMOVED]: NotificationRemoved
};

const NotificationSubscriptionPayload = new GraphQLUnionType({
  name: 'NotificationSubscriptionPayload',
  types: () => Object.values(resolveTypeLookup),
  resolveType: ({type}) => resolveTypeLookup[type]
});

export default NotificationSubscriptionPayload;
