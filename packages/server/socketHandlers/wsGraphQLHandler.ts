import rateLimitedGraphQL from '../graphql/graphql'
import Schema from '../graphql/rootSchema'
import ConnectionContext from '../socketHelpers/ConnectionContext'
import {getUserId} from '../utils/authorization'
import RethinkDataLoader from '../utils/RethinkDataLoader'
import sanitizeGraphQLErrors from '../utils/sanitizeGraphQLErrors'
import sendToSentry from '../utils/sendToSentry'
import prepareErrorForSentry from '../utils/prepareErrorForSentry'

interface Payload {
  query: string
  variables?: {[key: string]: any} | undefined
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
