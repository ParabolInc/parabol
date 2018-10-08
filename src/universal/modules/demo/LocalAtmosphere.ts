import EventEmitter from 'eventemitter3'
import {stringify} from 'flatted'
import {
  Environment,
  FetchFunction,
  Network,
  RecordSource,
  Store,
  SubscribeFunction
} from 'relay-runtime'
import {TEAM} from 'universal/utils/constants'
import handlerProvider from 'universal/utils/relay/handlerProvider'
import ClientGraphQLServer from './ClientGraphQLServer'
// import sleep from 'universal/utils/sleep'

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

  fetchLocal: FetchFunction = async (operation, variables) => {
    const res = this.clientGraphQLServer.fetch(operation.name, variables)
    if (operation.name === 'EndNewMeetingMutation') {
      window.localStorage.removeItem('retroDemo')
    } else {
      // await sleep(1000)
      this.clientGraphQLServer.db._updatedAt = new Date()
      window.localStorage.setItem('retroDemo', stringify(this.clientGraphQLServer.db))
    }
    return res
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
