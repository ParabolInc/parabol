import {GraphQLUnionType} from 'graphql';

const GraphQLSubscriptionType = (name, types) => new GraphQLUnionType({
  name,
  types,
  resolveType: (data, context, info) => {
    const {type} = data;
    const concreteType = types.find((t) => t.toString() === type);
    if (concreteType) return concreteType;
    const abstractType = info.schema.getType(type);
    return abstractType.resolveType(data, context, info);
  }
});

export default GraphQLSubscriptionType;
