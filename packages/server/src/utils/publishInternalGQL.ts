import AuthToken from '../database/types/AuthToken'
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
      authToken,
      query,
      ip,
      isPrivate: true
    })
  } catch (e) {
    sendToSentry(e, {tags: {jobId}})
    return undefined
  }
}

export default publishInternalGQL
