import type {ExecutionResult} from 'graphql'
import ServerAuthToken from '../database/types/ServerAuthToken'
import getDataLoader from '../graphql/getDataLoader'
import privateSchema from '../graphql/private/rootSchema'
import {yoga} from '../yoga'
import encodeAuthToken from './encodeAuthToken'

// Only call this from the server that is running yoga! e.g. a webhook endpoint or similar
export const callGQL = async <TData>(query: string, variables?: Record<string, any>) => {
  const authToken = encodeAuthToken(new ServerAuthToken())
  const dataLoader = getDataLoader()
  const {execute, parse} = yoga.getEnveloped()
  const result = await execute({
    document: parse(query),
    variableValues: variables,
    schema: privateSchema,
    contextValue: {dataLoader, authToken}
  })
  return result as ExecutionResult<TData>
}
