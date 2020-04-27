import {ExecutionResult} from 'graphql'
import {ServerChannel} from 'parabol-client/types/constEnums'
import PubSubPromise from './PubSubPromise'

export interface PubSubPromiseResponse extends ExecutionResult {
  jobId: string
}

let pubsub: PubSubPromise<PubSubPromiseResponse>
const getGraphQLExecutor = () => {
  if (!pubsub) {
    pubsub = new PubSubPromise(
      ServerChannel.GQL_EXECUTOR_REQUEST,
      ServerChannel.GQL_EXECUTOR_RESPONSE
    )
  }
  return pubsub
}
export default getGraphQLExecutor
