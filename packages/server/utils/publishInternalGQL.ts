import AuthToken from '../database/types/AuthToken'
import getGraphQLExecutor from './getGraphQLExecutor'

interface Options {
  socketId: string
  ip?: string
  query: string
  variables?: Record<string, any>
  authToken: AuthToken
}

const publishInternalGQL = async <NarrowResponse>(options: Options) => {
  const {socketId, query, ip, authToken, variables} = options
  try {
    return await getGraphQLExecutor().publish<NarrowResponse>({
      socketId,
      authToken,
      query,
      variables,
      ip,
      isPrivate: true
    })
  } catch (e) {
    return undefined
  }
}

export default publishInternalGQL
