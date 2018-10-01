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

export default class LocalAtmosphere extends Environment {
  eventEmitter = new EventEmitter()
  clientGraphQLServer = new ClientGraphQLServer()
  viewerId = 'demoUser'
  constructor () {
    // @ts-ignore
    super({store: new Store(new RecordSource()), handlerProvider})
    // @ts-ignore
    this._network = Network.create(this.fetchLocal, this.subscribeLocal)
  }

  fetchLocal: FetchFunction = (operation, variables) => {
    return this.clientGraphQLServer.fetch(operation.name, variables)
  }

  subscribeLocal: SubscribeFunction = (operation, _variables, _cacheConfig, observer) => {
    this.eventEmitter.on(operation.name, (data) => {
      if (observer.onNext) {
        observer.onNext(data)
      }
    })
    return {
      dispose: () => {
        /*noop*/
      }
    }
  }
}
