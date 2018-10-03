import EventEmitter from 'eventemitter3'
import {
  Environment,
  FetchFunction,
  Network,
  RecordSource,
  Store,
  SubscribeFunction
} from 'relay-runtime'
import handlerProvider from 'universal/utils/relay/handlerProvider'
import ClientGraphQLServer from './ClientGraphQLServer'
import {TEAM} from 'universal/utils/constants'

export default class LocalAtmosphere extends Environment {
  eventEmitter = new EventEmitter()
  clientGraphQLServer = new ClientGraphQLServer()
  viewerId = 'demoUser'
  constructor () {
    // @ts-ignore
    super({store: new Store(new RecordSource()), handlerProvider})
    // @ts-ignore
    this._network = Network.create(this.fetchLocal, this.subscribeLocal)
    // this.clientGraphQLServer.on(TEAM, (teamSubscription) => {
    //   {teamSubscription}
    // })
  }

  fetchLocal: FetchFunction = (operation, variables) => {
    return this.clientGraphQLServer.fetch(operation.name, variables)
  }

  subscribeLocal: SubscribeFunction = (operation, _variables, _cacheConfig, observer) => {
    this.eventEmitter.on(TEAM, (data) => {
      if (observer.onNext) {
        observer.onNext({
          [operation.name]: data
        })
      }
    })
    return {
      dispose: () => {
        /*noop*/
      }
    }
  }
}
