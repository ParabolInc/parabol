import Schema from 'server/graphql/rootSchema'
import RethinkDataLoader from 'server/utils/RethinkDataLoader'
import sendGraphQLErrorResult from 'server/utils/sendGraphQLErrorResult'
import sanitizeGraphQLErrors from 'server/utils/sanitizeGraphQLErrors'
import rateLimitedGraphQL from 'server/graphql/graphql'

export default async function wsGraphQLHandler (connectionContext, payload) {
  const {query, variables} = payload
  const {id: socketId, authToken, sharedDataLoader, rateLimiter, uploadManager} = connectionContext
  const dataLoader = sharedDataLoader.add(new RethinkDataLoader(authToken))
  const context = {
    authToken,
    socketId,
    dataLoader,
    uploadManager,
    rateLimiter
  }
  const result = await rateLimitedGraphQL(Schema, query, {}, context, variables)
  dataLoader.dispose()

  if (result.errors) {
    const errorType = !socketId ? 'HTTP' : connectionContext.socket.constructor.name
    sendGraphQLErrorResult(errorType, result.errors[0], query, variables, authToken)
  }
  return sanitizeGraphQLErrors(result)
}
