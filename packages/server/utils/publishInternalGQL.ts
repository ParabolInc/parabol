import AuthToken from '../database/types/AuthToken'
import {getUserId} from './authorization'
import getGraphQLExecutor from './getGraphQLExecutor'
import sendToSentry from './sendToSentry'

interface Options {
  type: string
  socketId: string
  ip: string
  query: string
  authToken: AuthToken
}

const publishInternalGQL = async (options: Options) => {
  const {socketId, type, query, ip, authToken} = options
  const jobId = `${socketId}:${type}`
  try {
    return await getGraphQLExecutor().publish({
      jobId,
      socketId,
      authToken,
      query,
      ip,
      isPrivate: true
    })
  } catch (e) {
    const viewerId = getUserId(authToken)
    const error = typeof e === 'string' ? new Error(e) : e
    sendToSentry(error, {userId: viewerId, tags: {jobId}})
    return undefined
  }
}

export default publishInternalGQL
