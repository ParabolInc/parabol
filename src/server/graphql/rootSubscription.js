import {GraphQLObjectType} from 'graphql';

const rootFields = {};

export default new GraphQLObjectType({
  name: 'RootSubscription',
  fields: () => rootFields
});
