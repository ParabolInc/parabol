import {ExecutionResult} from 'graphql'
import {ServerChannel} from 'parabol-client/types/constEnums'
import SocketServerId from '../../client/shared/gqlIds/SocketServerId'
import {GQLRequest} from '../graphql/executeGraphQL'
import PubSubPromise from './PubSubPromise'

let pubsub: PubSubPromise<GQLRequest & {executorServerId?: string}, ExecutionResult>
const getGraphQLExecutor = () => {
  if (!pubsub) {
    pubsub = new PubSubPromise(
      ServerChannel.GQL_EXECUTOR_STREAM,
      SocketServerId.join(process.env.SERVER_ID!)
    )
  }
  return pubsub
}
export default getGraphQLExecutor
