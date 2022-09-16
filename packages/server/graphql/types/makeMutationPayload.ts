import {GraphQLObjectType, GraphQLUnionType} from 'graphql'
import ErrorPayload from './ErrorPayload'

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
