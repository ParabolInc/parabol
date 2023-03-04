import {GraphQLFieldConfigMap, GraphQLObjectType} from 'graphql'

const graphQLSubscriptionType = (name: string, types: GraphQLObjectType[]) => {
  const fields = {} as GraphQLFieldConfigMap<any, any>
  types.forEach((gqlType) => {
    fields[gqlType.name] = {
      type: gqlType
    }
  })
  return new GraphQLObjectType({
    name,
    fields
  })
  // return new GraphQLUnionType({
  //   name,
  //   types,
  //   resolveType: (data, context, info) => {
  //     const {type} = data
  //     const concreteType = types.find((t) => t.toString() === type)
  //     if (concreteType) return concreteType
  //     const unknownType = info.schema.getType(type)
  //     if (isInterfaceType(unknownType) || isUnionType(unknownType)) {
  //       if (unknownType.resolveType) {
  //         return unknownType.resolveType(data, context, info, unknownType)
  //       }
  //       // should never happen, but that depends on using the resolveType pattern for all abstract types
  //       return null
  //     }
  //     // added via SDL
  //     if (isObjectType(unknownType)) {
  //       return unknownType
  //     }
  //     // Should not happen, did we add non-object types as subscription payload?
  //     return null
  //   }
  // })
}
export default graphQLSubscriptionType
