import {GraphQLUnionType} from 'graphql';

const GraphQLSubscriptionType = (name, types) => new GraphQLUnionType({
  name,
  types,
  resolveType: (data, context, info) => {
    const {type} = data;
    const concreteType = types.find((t) => t.toString() === type);
    if (concreteType) return concreteType;
    console.log('ABSTRACT TYPE', type);
    const abstractType = info.schema.getType(type);
    console.log('ABSTRACT SCHEMA TYPE', abstractType);
    const newType = abstractType.resolveType(data, context, info);
    console.log('NEW TYPE', newType);
    return newType;
  }
});

export default GraphQLSubscriptionType;
