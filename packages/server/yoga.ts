import {usePersistedOperations} from '@graphql-yoga/plugin-persisted-operations'
import {renderGraphiQL} from '@graphql-yoga/render-graphiql'
import type {GraphQLParams} from 'graphql-yoga'
import {createYoga} from 'graphql-yoga'
import uws from 'uWebSockets.js'
import AuthToken from './database/types/AuthToken'
import getDataLoader from './graphql/getDataLoader'
import getRateLimiter from './graphql/getRateLimiter'
import rootSchema from './graphql/public/rootSchema'
import getKysely from './postgres/getKysely'

interface ServerContext {
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
  plugins: [
    usePersistedOperations({
      skipDocumentValidation: true,
      extractPersistedOperationId,
      getPersistedOperation
    })
  ],

  schema: rootSchema,
  renderGraphiQL,
  context: async () => {
    const dataLoader = getDataLoader()
    dataLoader.share()
    const rateLimiter = getRateLimiter()
    return {dataLoader, rateLimiter}
  },
  graphiql: {
    subscriptionsProtocol: 'WS' // use WebSockets instead of SSE
  }
})
