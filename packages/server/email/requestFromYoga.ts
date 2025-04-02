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
  const res = await execute({
    document: parse(query),
    variableValues: variables,
    schema,
    contextValue: context
  })
  // yoga creates objects using a null prototype. Relay incorrectly uses `{}.hasOwnProperty`
  // As a quick hack, we recate the objects using an Object prototype here
  res.data = JSON.parse(JSON.stringify(res.data))
  return res
}
