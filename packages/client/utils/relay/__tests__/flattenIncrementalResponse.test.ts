import {
  type ConcreteRequest,
  createOperationDescriptor,
  createReaderSelector,
  Environment,
  type GraphQLSingularResponse,
  Network,
  Observable,
  type ReaderFragment,
  RecordSource,
  Store
} from 'relay-runtime'
import flattenIncrementalResponse, {type IncrementalFrame} from '../flattenIncrementalResponse'

const DEFER_LABEL = 'DeferTestQuery$defer$DeferTest_viewer'

const idField = {
  alias: null,
  args: null,
  kind: 'ScalarField',
  name: 'id',
  storageKey: null
} as const
const preferredNameField = {
  alias: null,
  args: null,
  kind: 'ScalarField',
  name: 'preferredName',
  storageKey: null
} as const

const deferredFragment: ReaderFragment = {
  argumentDefinitions: [],
  kind: 'Fragment',
  metadata: null,
  name: 'DeferTest_viewer',
  selections: [preferredNameField],
  type: 'User',
  abstractKey: null
}

const request: ConcreteRequest = {
  fragment: {
    argumentDefinitions: [],
    kind: 'Fragment',
    metadata: null,
    name: 'DeferTestQuery',
    selections: [
      {
        alias: null,
        args: null,
        concreteType: 'User',
        kind: 'LinkedField',
        name: 'viewer',
        plural: false,
        selections: [idField, {args: null, kind: 'FragmentSpread', name: 'DeferTest_viewer'}],
        storageKey: null
      }
    ],
    type: 'Query',
    abstractKey: null
  },
  kind: 'Request',
  operation: {
    argumentDefinitions: [],
    kind: 'Operation',
    name: 'DeferTestQuery',
    selections: [
      {
        alias: null,
        args: null,
        concreteType: 'User',
        kind: 'LinkedField',
        name: 'viewer',
        plural: false,
        selections: [
          idField,
          {if: null, kind: 'Defer', label: DEFER_LABEL, selections: [preferredNameField]}
        ],
        storageKey: null
      }
    ]
  },
  params: {
    id: 'DeferTestQuery',
    metadata: {},
    name: 'DeferTestQuery',
    operationKind: 'query',
    text: null
  }
}

const initialFrame: IncrementalFrame = {data: {viewer: {id: 'u1'}}, hasNext: true}
const deferredFrame: IncrementalFrame = {
  incremental: [{data: {preferredName: 'Jordan'}, path: ['viewer'], label: DEFER_LABEL}],
  hasNext: false
}

const legacyRewrite = (frame: IncrementalFrame): GraphQLSingularResponse[] => [
  {...frame, data: frame.data ?? {}}
]

const replayThroughRelay = async (
  frames: IncrementalFrame[],
  toResponses: (frame: IncrementalFrame) => GraphQLSingularResponse[] = flattenIncrementalResponse
) => {
  const network = Network.create(() =>
    Observable.create((sink) => {
      frames.forEach((frame) => {
        const responses = toResponses(frame)
        if (responses.length > 0) sink.next(responses)
      })
      sink.complete()
    })
  )
  const environment = new Environment({network, store: new Store(new RecordSource())})
  const operation = createOperationDescriptor(request, {})
  await new Promise<void>((resolve, reject) => {
    environment.execute({operation}).subscribe({complete: resolve, error: reject})
  })
  return environment.lookup(createReaderSelector(deferredFragment, 'u1', {}, operation.request))
}

describe('flattenIncrementalResponse', () => {
  it('passes a plain response through untouched', () => {
    const response = {data: {viewer: {id: 'u1'}}}
    expect(flattenIncrementalResponse(response)).toEqual([response])
  })

  it('passes an error-only response through untouched', () => {
    const response = {data: null, errors: [{name: 'GraphQLError', message: 'boom'}]}
    expect(flattenIncrementalResponse(response)).toEqual([response])
  })

  it('keeps the initial frame of an incremental response', () => {
    expect(flattenIncrementalResponse(initialFrame)).toEqual([{data: {viewer: {id: 'u1'}}}])
  })

  it('unwraps incremental entries into path/label responses', () => {
    expect(flattenIncrementalResponse(deferredFrame)).toEqual([
      {data: {preferredName: 'Jordan'}, path: ['viewer'], label: DEFER_LABEL}
    ])
  })

  it('emits initial data ahead of incremental entries carried on the same frame', () => {
    const frame: IncrementalFrame = {
      data: {viewer: {id: 'u1'}},
      incremental: [{data: {preferredName: 'Jordan'}, path: ['viewer'], label: DEFER_LABEL}],
      hasNext: false
    }
    expect(flattenIncrementalResponse(frame)).toEqual([
      {data: {viewer: {id: 'u1'}}},
      {data: {preferredName: 'Jordan'}, path: ['viewer'], label: DEFER_LABEL}
    ])
  })

  it('drops a bare terminator frame', () => {
    expect(flattenIncrementalResponse({hasNext: false})).toEqual([])
  })

  it('keeps an incremental entry whose deferred resolver errored', () => {
    const entry = {
      data: null,
      errors: [{name: 'GraphQLError', message: 'token expired'}],
      path: ['viewer'],
      label: DEFER_LABEL
    }
    expect(flattenIncrementalResponse({incremental: [entry], hasNext: false})).toEqual([entry])
  })

  it('leaves the @defer fragment missing when the envelope is passed through as root data', async () => {
    const snapshot = await replayThroughRelay([initialFrame, deferredFrame], legacyRewrite)
    expect(snapshot.isMissingData).toBe(true)
  })

  it('lets relay resolve a @defer fragment from flattened frames', async () => {
    const snapshot = await replayThroughRelay([initialFrame, deferredFrame])
    expect(snapshot.isMissingData).toBe(false)
    expect(snapshot.data).toEqual({preferredName: 'Jordan'})
  })

  it('lets relay resolve a @defer fragment when a terminator frame trails the data', async () => {
    const snapshot = await replayThroughRelay([
      initialFrame,
      {...deferredFrame, hasNext: true},
      {hasNext: false}
    ])
    expect(snapshot.isMissingData).toBe(false)
    expect(snapshot.data).toEqual({preferredName: 'Jordan'})
  })
})
