import {GraphQLUnionType} from 'graphql';

const GraphQLSubscriptionType = (name, types) => new GraphQLUnionType({
  name,
  types,
  resolveType: ({type}) => types.find((t) => t.toString() === type)
});

export default GraphQLSubscriptionType;
