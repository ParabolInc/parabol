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

const request = {
  id: 'q_test',
  name: 'TestQuery',
  operationKind: 'query',
  text: null,
  metadata: {},
  cacheID: 'test',
  providedVariables: {}
} as unknown as RequestParameters

const fetchOverHTTP = async (body: string) => {
  const chunks = [body.slice(0, 40), body.slice(40, 90), body.slice(90)]
  global.fetch = jest.fn(async () => {
    return new Response(streamChunks(chunks), {
      headers: {'content-type': 'multipart/mixed; boundary="-"'}
    })
  })
  const {default: Atmosphere} = await import('../Atmosphere')
  const atmosphere = new Atmosphere()
  const fetchResult = atmosphere.fetchFunction(request, {}, {}, undefined)
  if (!('subscribe' in fetchResult)) throw new Error('Expected an observable')
  return new Promise<GraphQLResponse[]>((resolve, reject) => {
    const payloads: GraphQLResponse[] = []
    fetchResult.subscribe({
      next: (payload) => payloads.push(payload),
      complete: () => resolve(payloads),
      error: reject
    })
  })
}

describe('Atmosphere multipart responses', () => {
  const originalFetch = global.fetch
  beforeAll(() => {
    Object.assign(globalThis, {__APP_VERSION__: '1.0.0'})
  })
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('keeps a payload whose text contains the boundary', async () => {
    const initial = {
      data: {node: {id: 'node1', name: 'Plan --- review ----- notes'}},
      hasNext: true
    }
    const deferred = {
      incremental: [{data: {detail: 'a---b'}, path: ['node'], label: 'Test$defer$detail'}],
      hasNext: false
    }
    const payloads = await fetchOverHTTP(`${part(initial)}${part(deferred)}\r\n-----\r\n`)
    expect(payloads).toEqual([
      initial,
      {data: {detail: 'a---b'}, path: ['node'], label: 'Test$defer$detail', hasNext: false}
    ])
  })

  it('fails the request when a part is not JSON', async () => {
    const malformedPart =
      '\r\n---\r\nContent-Type: application/json; charset=utf-8\r\n\r\n{"data": {"node": '
    await expect(fetchOverHTTP(`${malformedPart}\r\n-----\r\n`)).rejects.toThrow(
      'TestQuery got a multipart part that is not JSON'
    )
  })
})
