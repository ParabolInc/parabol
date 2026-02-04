import type {ExecutionResult} from 'graphql'
import ServerAuthToken from '../database/types/ServerAuthToken'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import privateSchema from '../graphql/private/rootSchema'
import {yoga} from '../yoga'

// Only call this from the server that is running yoga! e.g. a webhook endpoint or similar
export const callGQL = async <TData>(query: string, variables?: Record<string, any>) => {
  const authToken = new ServerAuthToken()
  const dataLoader = getNewDataLoader('callGQL')
  const {execute, parse, contextFactory} = yoga.getEnveloped()
  const envelopedContext = await contextFactory()
  const result = await execute({
    document: parse(query),
    variableValues: variables,
    schema: privateSchema,
    contextValue: {...envelopedContext, dataLoader, authToken}
  })
  dataLoader.dispose()
  return result as ExecutionResult<TData>
}
