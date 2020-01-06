import ErrorPayload from './ErrorPayload'
import {GraphQLUnionType, GraphQLObjectType} from 'graphql'

const makeMutationPayload = (name: string, successType: GraphQLObjectType) => {
  return new GraphQLUnionType({
    name,
    description: `Return object for ${name}`,
    types: [ErrorPayload, successType],
    resolveType: ({error}) => {
      return error ? ErrorPayload : successType
    }
  })
}

export default makeMutationPayload
