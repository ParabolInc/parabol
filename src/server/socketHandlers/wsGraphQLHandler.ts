import rateLimitedGraphQL from 'server/graphql/graphql'
import Schema from 'server/graphql/rootSchema'
import ConnectionContext from 'server/socketHelpers/ConnectionContext'
import {getUserId} from 'server/utils/authorization'
import RethinkDataLoader from 'server/utils/RethinkDataLoader'
import sanitizeGraphQLErrors from 'server/utils/sanitizeGraphQLErrors'
import sendToSentry from 'server/utils/sendToSentry'
import prepareErrorForSentry from '../utils/prepareErrorForSentry'

interface Payload {
  query: string
  variables: {[key: string]: any} | undefined
}

export default async function wsGraphQLHandler (
  connectionContext: ConnectionContext,
  payload: Payload
) {
  const {query, variables} = payload
  const {id: socketId, authToken, sharedDataLoader, rateLimiter} = connectionContext
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken))
  const context = {
    authToken,
    socketId,
    dataLoader,
    rateLimiter
  }
  const result = await rateLimitedGraphQL(Schema, query, {}, context, variables)
  dataLoader.dispose()

  if (result.errors) {
    const viewerId = getUserId(authToken)
    const error = prepareErrorForSentry(result.errors[0])
    sendToSentry(error, {
      tags: {
        query: query.slice(0, 40),
        variables: JSON.stringify(variables),
        path: error.path,
        locations: JSON.stringify(error.locations)
      },
      userId: viewerId
    })
  }
  return sanitizeGraphQLErrors(result)
}
