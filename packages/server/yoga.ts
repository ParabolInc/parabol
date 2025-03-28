import {usePersistedOperations} from '@graphql-yoga/plugin-persisted-operations'
import type {GraphQLParams} from 'graphql-yoga'
import {createYoga, useReadinessCheck} from 'graphql-yoga'
import {sql} from 'kysely'
import uws from 'uWebSockets.js'
import sleep from '../client/utils/sleep'
import AuthToken from './database/types/AuthToken'
import getDataLoader from './graphql/getDataLoader'
import getRateLimiter from './graphql/getRateLimiter'
import rootSchema from './graphql/public/rootSchema'
import getKysely from './postgres/getKysely'
import getVerifiedAuthToken from './utils/getVerifiedAuthToken'
import {usePrivateSchemaForSuperUser} from './utils/usePrivateSchemaForSuperUser'

export interface ServerContext {
  req: uws.HttpRequest
  res: uws.HttpResponse
  ip: string
  authToken: AuthToken | null
}

export const extractPersistedOperationId = (
  params: GraphQLParams & {docId?: string; operationName?: string | null}
) => {
  return params.docId!
}

export const getPersistedOperation = async (docId: string) => {
  if (!__PRODUCTION__) {
    const queryMap = require('../../queryMap.json')
    const queryString = queryMap[docId]
    return queryString
  }
  const queryStringRes = await getKysely()
    .selectFrom('QueryMap')
    .select('query')
    .where('id', '=', docId)
    .executeTakeFirst()
  return queryStringRes?.query
}

export const yoga = createYoga<ServerContext>({
  graphqlEndpoint: '/graphql',
  plugins: [
    usePersistedOperations({
      allowArbitraryOperations(request) {
        const {headers} = request
        const authHeader = headers.get('authorization')
        const token = authHeader?.slice(7)
        const authToken = getVerifiedAuthToken(token)
        const isSuperUser = authToken?.rol === 'su'
        return isSuperUser
      },
      skipDocumentValidation: true,
      extractPersistedOperationId,
      getPersistedOperation
    }),
    usePrivateSchemaForSuperUser,
    useReadinessCheck({
      check: async () => {
        const res = await Promise.race([sql`SELECT 1`.execute(getKysely()), sleep(5000)])
        if (!res) throw new Error('503')
      }
    })
  ],
  // There is a bug in graphql-yoga where calling `yoga.getEnveloped` does not work from within graphql-ws when `schema` returns a function
  // As a workaround, we set the schema via plugin using the `onEnveloped` hook
  schema: rootSchema,
  context: async () => {
    const dataLoader = getDataLoader()
    dataLoader.share()
    const rateLimiter = getRateLimiter()
    return {dataLoader, rateLimiter}
  }
})
