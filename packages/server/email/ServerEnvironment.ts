import {FormattedExecutionResult} from 'graphql'
import {Environment, FetchFunction, Network, RecordSource, Store} from 'relay-runtime'
import type {InternalContext} from '../graphql/graphql'
import {requestFromYoga} from './requestFromYoga'

const noop = (): any => {
  /**/
}

export default class ServerEnvironment extends Environment {
  requestCache: Promise<FormattedExecutionResult>[] = []
  results: FormattedExecutionResult[] | undefined
  isFetched = false
  context: InternalContext
  constructor(context: InternalContext) {
    super({
      store: new Store(new RecordSource()),
      network: Network.create(noop),
      isServer: true
    })
    ;(this as any)._network = Network.create(this.fetch)
    this.context = context
  }

  async load() {
    if (!this.isFetched) {
      this.isFetched = true
      this.results = await Promise.all(this.requestCache)
      this.requestCache = []
    }
  }

  fetch: FetchFunction = (request, variables) => {
    if (!this.isFetched) {
      this.requestCache.push(requestFromYoga(this.context, request.id!, variables))
      // relay expects an array of responses, or a single valid response
      return [] as any
    } else {
      return this.results!.shift()
    }
  }
}
