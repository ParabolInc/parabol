import PubSubPromise from './PubSubPromise'
import {ServerChannel} from 'parabol-client/lib/types/constEnums'
import {ExecutionResult} from 'graphql'

interface Response extends ExecutionResult {
  jobId: string
}

let pubsub: PubSubPromise<Response>
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
