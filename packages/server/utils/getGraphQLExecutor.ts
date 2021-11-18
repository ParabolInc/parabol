import {ExecutionResult} from 'graphql'
import {ServerChannel} from 'parabol-client/types/constEnums'
import {GQLRequest} from '../graphql/executeGraphQL'
import PubSubPromise from './PubSubPromise'

let pubsub: PubSubPromise<GQLRequest & {serverChannel?: string}, ExecutionResult>
const getGraphQLExecutor = () => {
  if (!pubsub) {
    pubsub = new PubSubPromise(
      ServerChannel.GQL_EXECUTOR_STREAM,
      ServerChannel.GQL_EXECUTOR_RESPONSE
    )
  }
  return pubsub
}
export default getGraphQLExecutor
