import type {Client} from 'graphql-ws'
import type {GraphQLResponse, RequestParameters} from 'relay-runtime'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

const part = (payload: object) =>
  `\r\n---\r\nContent-Type: application/json; charset=utf-8\r\n\r\n${JSON.stringify(payload)}`

const streamChunks = (chunks: string[]) => {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)))
      controller.close()
    }
  })
}

const makeRequest = (operationKind: RequestParameters['operationKind']) =>
  ({
    id: 'q_test',
    name: 'TestQuery',
    operationKind,
    text: null,
    metadata: {},
    cacheID: 'test',
    providedVariables: {}
  }) as unknown as RequestParameters

const multipartResponse = (body: string) => {
  const chunks = [body.slice(0, 40), body.slice(40, 90), body.slice(90)]
  return new Response(streamChunks(chunks), {
    headers: {'content-type': 'multipart/mixed; boundary="-"'}
  })
}

const jsonResponse = (payload: object) =>
  new Response(JSON.stringify(payload), {headers: {'content-type': 'application/json'}})

const collectPayloads = (fetchResult: {
  subscribe: (observer: {
    next: (payload: GraphQLResponse) => void
    complete: () => void
    error: (error: Error) => void
  }) => unknown
}) =>
  new Promise<GraphQLResponse[]>((resolve, reject) => {
    const payloads: GraphQLResponse[] = []
    fetchResult.subscribe({
      next: (payload) => payloads.push(payload),
      complete: () => resolve(payloads),
      error: reject
    })
  })

const fetchOverHTTP = async (
  response: Response,
  operationKind: RequestParameters['operationKind'] = 'query'
) => {
  global.fetch = jest.fn(async () => response)
  const {default: Atmosphere} = await import('../Atmosphere')
  const atmosphere = new Atmosphere()
  const fetchResult = atmosphere.fetchFunction(makeRequest(operationKind), {}, {}, undefined)
  if (!('subscribe' in fetchResult)) throw new Error('Expected an observable')
  return collectPayloads(fetchResult)
}

type SocketSink = {next: (value: object) => void; error: (error: unknown) => void}

const fetchOverSocket = async (
  operationKind: RequestParameters['operationKind'],
  respond: (sink: SocketSink & {complete: () => void}) => void
) => {
  const {default: Atmosphere} = await import('../Atmosphere')
  const atmosphere = new Atmosphere()
  const subscribe = (_payload: unknown, sink: SocketSink & {complete: () => void}) => {
    respond(sink)
    return () => {}
  }
  atmosphere.subscriptionClient = {subscribe} as unknown as Client
  return collectPayloads(atmosphere.fetchOrSubscribe(makeRequest(operationKind), {}, {}))
}

const notFound = {message: 'Team not found', extensions: {code: 'NOT_FOUND'}}

const expectedServerError = (message: string, code: string) =>
  expect.objectContaining({
    name: 'GraphQLServerError',
    message,
    code,
    traceId: expect.stringMatching(/^[0-9a-f]{32}$/)
  })

describe('Atmosphere', () => {
  const originalFetch = global.fetch
  beforeAll(() => {
    Object.assign(globalThis, {__APP_VERSION__: '1.0.0'})
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('multipart responses', () => {
    it('keeps a payload whose text contains the boundary', async () => {
      const initial = {
        data: {node: {id: 'node1', name: 'Plan --- review ----- notes'}},
        hasNext: true
      }
      const deferred = {
        incremental: [{data: {detail: 'a---b'}, path: ['node'], label: 'Test$defer$detail'}],
        hasNext: false
      }
      const payloads = await fetchOverHTTP(
        multipartResponse(`${part(initial)}${part(deferred)}\r\n-----\r\n`)
      )
      expect(payloads).toEqual([
        initial,
        {data: {detail: 'a---b'}, path: ['node'], label: 'Test$defer$detail', hasNext: false}
      ])
    })

    it('fails the request when a part is not JSON', async () => {
      const malformedPart =
        '\r\n---\r\nContent-Type: application/json; charset=utf-8\r\n\r\n{"data": {"node": '
      await expect(
        fetchOverHTTP(multipartResponse(`${malformedPart}\r\n-----\r\n`))
      ).rejects.toThrow('TestQuery got a multipart part that is not JSON')
    })

    it('fails the request with the server’s error when a deferred part has no data', async () => {
      const initial = {data: {node: {id: 'node1'}}, hasNext: true}
      const deferred = {
        incremental: [{data: null, errors: [notFound], path: ['node'], label: 'Test$defer$detail'}],
        hasNext: false
      }
      await expect(
        fetchOverHTTP(multipartResponse(`${part(initial)}${part(deferred)}\r\n-----\r\n`))
      ).rejects.toEqual(expectedServerError('Team not found', 'NOT_FOUND'))
    })
  })

  describe('server errors', () => {
    it('fails a query that got errors and no data with the server’s error', async () => {
      await expect(fetchOverHTTP(jsonResponse({data: null, errors: [notFound]}))).rejects.toEqual(
        expectedServerError('Team not found', 'NOT_FOUND')
      )
    })

    it('fails a mutation whose field failed, though its data is not null', async () => {
      const forbidden = {message: 'Not on team', extensions: {code: 'FORBIDDEN'}}
      const response = jsonResponse({data: {updateTeamName: null}, errors: [forbidden]})
      await expect(fetchOverHTTP(response, 'mutation')).rejects.toEqual(
        expectedServerError('Not on team', 'FORBIDDEN')
      )
    })

    it('keeps the partial data of a query whose field failed', async () => {
      const payload = {data: {team: null}, errors: [notFound]}
      await expect(fetchOverHTTP(jsonResponse(payload))).resolves.toEqual([payload])
    })

    it('fails a mutation over the socket that got errors and no data', async () => {
      const result = fetchOverSocket('mutation', (sink) => {
        sink.next({data: null, errors: [notFound]})
        sink.complete()
      })
      await expect(result).rejects.toEqual(expectedServerError('Team not found', 'NOT_FOUND'))
    })

    it('fails a mutation over the socket whose field failed', async () => {
      const result = fetchOverSocket('mutation', (sink) => {
        sink.next({data: {updateTeamName: null}, errors: [notFound]})
        sink.complete()
      })
      await expect(result).rejects.toEqual(expectedServerError('Team not found', 'NOT_FOUND'))
    })

    it('fails an operation the socket rejected with the server’s error', async () => {
      const tooManyRequests = {message: 'Slow down', extensions: {code: 'TOO_MANY_REQUESTS'}}
      const result = fetchOverSocket('mutation', (sink) => sink.error([tooManyRequests]))
      await expect(result).rejects.toEqual(expectedServerError('Slow down', 'TOO_MANY_REQUESTS'))
    })

    it('skips a subscription event that got errors and no data', async () => {
      const result = fetchOverSocket('subscription', (sink) => {
        sink.next({data: null, errors: [notFound]})
        sink.complete()
      })
      await expect(result).resolves.toEqual([])
    })
  })
})
