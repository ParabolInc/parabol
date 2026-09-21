import EventEmitter from 'eventemitter3'
import {
  Environment,
  type FetchFunction,
  fetchQuery,
  type GraphQLTaggedNode,
  Network,
  Observable,
  type OperationType,
  RecordSource,
  Store,
  type SubscribeFunction,
  type Variables
} from 'relay-runtime'
import handlerProvider from '../../utils/relay/handlerProvider'
import {TeamHealthDemo} from './teamHealthDemoIds'
import {createTeamHealthDemoMeetingResponse} from './teamHealthDemoMeetingFixture'
import {createTeamHealthDemoThreadResponse} from './teamHealthDemoThreadFixture'

const queryLookup: Record<string, (variables: Variables) => object> = {
  TeamHealthDemoRootQuery: () => createTeamHealthDemoMeetingResponse(),
  DiscussionThreadQuery: ({discussionId}) => createTeamHealthDemoThreadResponse(discussionId)
}

export default class TeamHealthDemoAtmosphere extends Environment {
  viewerId = TeamHealthDemo.VIEWER_ID
  eventEmitter = new EventEmitter()
  retries = new Set<() => void>()

  constructor() {
    super({
      store: new Store(new RecordSource(), {gcReleaseBufferSize: 10000}),
      handlerProvider,
      network: Network.create(
        (...args) => this.fetchFixture(...args),
        (...args) => this.subscribeToNothing(...args)
      )
    })
  }

  // there is no transport in this environment, so nothing a visitor does can reach a server.
  // A mutation that slips past the read-only UI is refused here rather than sent anywhere
  fetchFixture: FetchFunction = (operation, variables) => {
    const resolve = operation.operationKind === 'query' ? queryLookup[operation.name] : undefined
    if (!resolve) {
      return Observable.create((sink) =>
        sink.error(new Error(`${operation.name} is not available in the Team Health demo`))
      )
    }
    return Observable.from({data: resolve(variables)})
  }

  subscribeToNothing: SubscribeFunction = () => Observable.create(() => undefined)

  registerQuery = async () => undefined

  scheduleUnregisterQuery = () => undefined

  fetchQuery = async <T extends OperationType>(
    taggedNode: GraphQLTaggedNode,
    variables: Variables = {}
  ) => {
    try {
      return await fetchQuery<T>(this, taggedNode, variables, {
        fetchPolicy: 'store-or-network'
      }).toPromise()
    } catch {
      return null
    }
  }
}
