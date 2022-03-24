/*
  By convention, a MutationPayload is a Union of ErrorPayload | MutationSuccess
  e.g. type AddTaskPayload = ErrorPayload | AddTaskSuccess
  When a mutation resolver returns a value, GraphQL needs to ascertain
  whether the return value is an ErrorPayload or MutationSuccess
  It does this by calling `resolveType` on the union.
  This function finds all conventional MutationPayloads and
  adds that `resolveType` if one is not already defined
*/

import {GraphQLSchema} from 'graphql'
import {isUnionType} from 'graphql/type'

const resolveTypesForMutationPayloads = (schema: GraphQLSchema) => {
  Object.values(schema.getTypeMap()).forEach((type) => {
    if (!isUnionType(type) || !type.name.endsWith('Payload')) return
    const concreteTypes = type.getTypes()
    const errorType = concreteTypes.find((type) => type.name === 'ErrorPayload')
    const successName = `${type.name.slice(0, -'Payload'.length)}Success`
    const successType = concreteTypes.find((type) => type.name === successName)
    // Abort if the MutationPayload is not a default 2-part union of an ErrorPayload | Success
    if (!errorType || !successType || concreteTypes.length !== 2 || type.resolveType) return
    type.resolveType = ({error}) => (error?.message ? errorType : successType)
  })
  return schema
}

export default resolveTypesForMutationPayloads
