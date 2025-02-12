import {Variables} from 'relay-runtime'
import ServerAuthToken from '../database/types/ServerAuthToken'
import getGraphQLExecutor from './getGraphQLExecutor'

interface PublishOptions {
  longRunning?: boolean
}

const publishWebhookGQL = async <NarrowResponse>(
  query: string,
  variables: Variables,
  options?: PublishOptions
) => {
  try {
    return await getGraphQLExecutor().publish<NarrowResponse>({
      authToken: new ServerAuthToken(),
      query,
      variables,
      isPrivate: true,
      ...options
    })
  } catch (e) {
    return undefined
  }
}

export default publishWebhookGQL
