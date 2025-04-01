import type {InternalContext} from '../graphql/graphql'
// import {getPersistedOperation, yoga} from '../yoga'

export const requestFromYoga = async (
  context: InternalContext,
  docId: string,
  variables?: Record<string, any>
) => {
  // using require until this file is not required by any file that is used to create the schema (ie we move away from object-first GraphQL)
  const {getPersistedOperation, yoga} = require('../yoga')
  const {schema, execute, parse} = yoga.getEnveloped()
  const query = await getPersistedOperation(docId)
  return execute({
    document: parse(query),
    variableValues: variables,
    schema,
    contextValue: context
  })
}
