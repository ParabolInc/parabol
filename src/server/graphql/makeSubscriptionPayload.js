import {GraphQLObjectType} from 'graphql';
import {resolveSub} from 'server/graphql/resolvers';
import {ADDED, REMOVED, UPDATED} from 'universal/utils/constants';

const SUFFIX = 'SubscriptionPayload';
const actions = [ADDED, UPDATED, REMOVED];

const makeSubscriptionPayload = (type, resolver) => new GraphQLObjectType({
  name: `${type.name}${SUFFIX}`,
  fields: () => actions.reduce((obj, action) => {
    obj[action] = {type, resolve: resolveSub(action, resolver)};
    return obj;
  }, {})
});

export default makeSubscriptionPayload;
