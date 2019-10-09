import EventEmitter from 'eventemitter3'
import {stringify} from 'flatted'
import {requestSubscription} from 'react-relay'
import {
  Environment,
  FetchFunction,
  getRequest,
  Network,
  RecordSource,
  Store,
  SubscribeFunction
} from 'relay-runtime'
import {TASK, TEAM} from '../../utils/constants'
import handlerProvider from '../../utils/relay/handlerProvider'
import Atmosphere from '../../Atmosphere'
import ClientGraphQLServer from './ClientGraphQLServer'
import LinearPublishQueue from 'relay-linear-publish-queue'
import defaultGetDataID from 'relay-runtime/lib/defaultGetDataID'
// import sleep from 'universal/utils/sleep'

const store = new Store(new RecordSource())
export default class LocalAtmosphere extends Environment {
  eventEmitter = new EventEmitter()
  clientGraphQLServer = new ClientGraphQLServer(this)
  viewerId = 'demoUser'

  constructor() {
    // @ts-ignore
    super({
      store,
      handlerProvider,
      publishQueue: new LinearPublishQueue(store, handlerProvider, defaultGetDataID)
    } as any)
    // @ts-ignore
    this._network = Network.create(this.fetchLocal, this.subscribeLocal)
  }

  registerQuery: Atmosphere['registerQuery'] = async (_queryKey, _queryFetcher, options = {}) => {
    const {subscriptions, subParams, queryVariables} = options
    if (!subscriptions) return
    const subConfigs = subscriptions.map((subCreator) =>
      subCreator(this as any, queryVariables, subParams)
    )
    subConfigs.map((config) => {
      const {subscription} = config
      const request = getRequest(subscription)
      const name = request.params && request.params.name
      if (!name) throw new Error(`No name found for request ${request}`)
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
