import {GQLContext} from '../graphql/graphql'
import {Environment, FetchFunction, Network, RecordSource, Store} from 'relay-runtime'
import ssrGraphQL from '../graphql/ssrGraphQL'
import {ExecutionResult} from 'graphql'

const noop = (): any => {
  /**/
}

export default class ServerEnvironment extends Environment {
  requestCache: Promise<ExecutionResult>[] = []
  results: ExecutionResult[] | undefined
  isFetched = false

  constructor(public context: GQLContext) {
    super({
      store: new Store(new RecordSource()),
      network: Network.create(noop)
    })
    ;(this as any)._network = Network.create(this.fetch)
  }

  async load() {
    if (!this.isFetched) {
      this.isFetched = true
      this.results = await Promise.all(this.requestCache)
    }
  }

  // @ts-ignore
  fetch: FetchFunction = (request, variables) => {
    if (!this.isFetched) {
      this.requestCache.push(ssrGraphQL(request.id!, variables, this.context))
      return undefined
    } else {
      return this.results!.shift()
    }
  }
}
