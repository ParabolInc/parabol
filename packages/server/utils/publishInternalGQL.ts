import AuthToken from '../database/types/AuthToken'
import {getUserId} from './authorization'
import getGraphQLExecutor from './getGraphQLExecutor'
import sendToSentry from './sendToSentry'

interface Options {
  socketId: string
  ip?: string
  query: string
  variables?: Record<string, any>
  authToken: AuthToken
}

const publishInternalGQL = async (options: Options) => {
  const {socketId, query, ip, authToken, variables} = options
  try {
    return await getGraphQLExecutor().publish({
      socketId,
      authToken,
      query,
      variables,
      ip,
      isPrivate: true
    })
  } catch (e) {
    const viewerId = getUserId(authToken)
    const error = e instanceof Error ? e : new Error('GQL executor failed to publish')
    if (error.message === 'TIMEOUT') {
      sendToSentry(new Error('GQL executor took too long to respond'), {
        userId: getUserId(authToken),
        tags: {
          authToken: JSON.stringify(authToken),
          query: query || ''
        }
      })
    } else {
      sendToSentry(error, {userId: viewerId})
    }
    return undefined
  }
}

export default publishInternalGQL
