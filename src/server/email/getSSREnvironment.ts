import {GQLContext} from 'server/graphql/graphql'
import {Environment, FetchFunction, Network, RecordSource, Store} from 'relay-runtime'
import ssrGraphQL from 'server/graphql/ssrGraphQL'
import {ExecutionResult} from 'graphql'

const createSSREnviroment = (
  onData: (res: any) => void,
  context: GQLContext,
  requestId: string
) => {
  const ssrCache = {}
  const store = new Store(new RecordSource())
  // @ts-ignore
  const ssrFetch: FetchFunction = (request, variables) => {
    const cachedResult = ssrCache[requestId]
    if (cachedResult) {
      delete ssrCache[requestId]
      return cachedResult
    }
    ssrGraphQL(request.id, variables, context)
      .then((res) => {
        ssrCache[requestId] = res
        onData(res)
      })
      .catch(console.log)
    return undefined
  }
  const network = Network.create(ssrFetch)
  return new Environment({store, network})
}

const getSSREnvironment = (context: GQLContext) => {
  let onData
  const getData = new Promise<ExecutionResult<any>>((resolve) => {
    onData = resolve
  })
  const requestId = Math.random()
    .toString(36)
    .substring(5)
  const environment = createSSREnviroment(onData, context, requestId)
  return {environment, getData}
}

export default getSSREnvironment
