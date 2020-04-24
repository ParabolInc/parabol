import {ExecutionResult} from 'graphql'
import {Environment, FetchFunction, Network, RecordSource, Store} from 'relay-runtime'
import AuthToken from '../database/types/AuthToken'
import executeGraphQL from '../graphql/executeGraphQL'
import shortid from 'shortid'

const noop = (): any => {
  /**/
}

export default class ServerEnvironment extends Environment {
  requestCache: Promise<ExecutionResult>[] = []
  results: ExecutionResult[] | undefined
  isFetched = false
  authToken: AuthToken
  dataLoaderId: string
  constructor(authToken: AuthToken, dataLoaderId: string) {
    super({
      store: new Store(new RecordSource()),
      network: Network.create(noop)
    })
    ;(this as any)._network = Network.create(this.fetch)
    this.authToken = authToken
    this.dataLoaderId = dataLoaderId
  }

  async load() {
    if (!this.isFetched) {
      this.isFetched = true
      this.results = await Promise.all(this.requestCache)
      this.requestCache = []
    }
  }

  // @ts-ignore
  fetch: FetchFunction = (request, variables) => {
    if (!this.isFetched) {
      this.requestCache.push(
        executeGraphQL({
          jobId: shortid.generate(),
          authToken: this.authToken,
          docId: request.id!,
          variables,
          dataLoaderId: this.dataLoaderId
        })
      )
      return undefined
    } else {
      return this.results!.shift()
    }
  }
}
