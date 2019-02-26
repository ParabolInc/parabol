import Schema from 'server/graphql/rootSchema'
import RethinkDataLoader from 'server/utils/RethinkDataLoader'
import sanitizeGraphQLErrors from 'server/utils/sanitizeGraphQLErrors'
import rateLimitedGraphQL from 'server/graphql/graphql'
import {getUserId} from 'server/utils/authorization'
import sendToSentry from 'server/utils/sendToSentry'
import ConnectionContext from 'server/socketHelpers/ConnectionContext'

interface Payload {
  query: string
  variables: {[key: string]: any}
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
    // used for debugging staging @v3.5.0
    console.error(result.errors)
    sendToSentry(result.errors[0], {tags: {query, variables}, userId: viewerId})
  }
  return sanitizeGraphQLErrors(result)
}
