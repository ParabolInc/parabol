import EventEmitter from 'eventemitter3'
import {stringify} from 'flatted'
import {requestSubscription} from 'react-relay'
import {
  Environment,
  FetchFunction,
  Network,
  RecordSource,
  Store,
  SubscribeFunction
} from 'relay-runtime'
import {TASK, TEAM} from 'universal/utils/constants'
import handlerProvider from 'universal/utils/relay/handlerProvider'
import ClientGraphQLServer from './ClientGraphQLServer'
// import sleep from 'universal/utils/sleep'

export default class LocalAtmosphere extends Environment {
  eventEmitter = new EventEmitter()
  clientGraphQLServer = new ClientGraphQLServer(this)
  viewerId = 'demoUser'

  constructor () {
    // @ts-ignore
    super({store: new Store(new RecordSource()), handlerProvider})
    // @ts-ignore
    this._network = Network.create(this.fetchLocal, this.subscribeLocal)
  }

  registerQuery = async (_queryKey, subscriptions, subParams, queryVariables) => {
    subscriptions.forEach((subCreator) => {
      const config = subCreator(this, queryVariables, subParams)
      requestSubscription(this, {...config})
    })
  }

  fetchLocal: FetchFunction = async (operation, variables) => {
    const res = (await this.clientGraphQLServer.fetch(operation.name, variables)) as any
    if (res.endNewMeeting && res.endNewMeeting.isKill) {
      window.localStorage.removeItem('retroDemo')
    } else {
      // await sleep(1000)
      this.clientGraphQLServer.db._updatedAt = new Date()
      window.localStorage.setItem('retroDemo', stringify(this.clientGraphQLServer.db))
    }
    return res
  }

  subscribeLocal: SubscribeFunction = (operation, _variables, _cacheConfig, observer) => {
    const channelLookup = {
      TaskSubscription: {
        channel: TASK,
        dataField: 'taskSubscription'
      },
      TeamSubscription: {
        channel: TEAM,
        dataField: 'teamSubscription'
      }
    }
    const fields = channelLookup[operation.name]
    if (fields) {
      this.clientGraphQLServer.on(fields.channel, (data) => {
        if (observer.onNext) {
          observer.onNext({
            data: {
              [fields.dataField]: data
            }
          })
        }
      })
    }
    return {
      dispose: () => {
        /*noop*/
      }
    }
  }
}
