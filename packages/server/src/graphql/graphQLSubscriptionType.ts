import {GraphQLInterfaceType, GraphQLObjectType, GraphQLUnionType} from 'graphql'

const graphQLSubscriptionType = (name: string, types: GraphQLObjectType[]) =>
  new GraphQLUnionType({
    name,
    types,
    resolveType: (data, context, info) => {
      const {type} = data
      const concreteType = types.find((t) => t.toString() === type)
      if (concreteType) return concreteType
      const abstractType = info.schema.getType(type) as GraphQLInterfaceType | GraphQLUnionType
      if (abstractType.resolveType) {
        return abstractType.resolveType(data, context, info, abstractType)
      }
      // should never happen, but that depends on using the resolveType pattern for all abstract types
      return null
    }
  })

export default graphQLSubscriptionType
