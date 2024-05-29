import {Variables} from 'relay-runtime'
import ServerAuthToken from '../database/types/ServerAuthToken'
import getGraphQLExecutor from './getGraphQLExecutor'
import sendToSentry from './sendToSentry'

interface PublishOptions {
  longRunning?: boolean
}

const publishWebhookGQL = async (query: string, variables: Variables, options?: PublishOptions) => {
  try {
    return await getGraphQLExecutor().publish({
      authToken: new ServerAuthToken(),
      query,
      variables,
      isPrivate: true,
      ...options
    })
  } catch (e) {
    const error = e instanceof Error ? e : new Error('GQL executor failed to publish')
    sendToSentry(error, {tags: {query: query.slice(0, 50)}})
    return undefined
  }
}

export default publishWebhookGQL
