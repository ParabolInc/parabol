import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import {getBreadcrumbs} from '../../utils/clientBreadcrumbs'
import joinMeeting from '../joinMeeting'
import {createQueryRefs} from '../queryRefs'

type JoinHandlers = {onCompleted: (response: unknown) => void; onError: () => void}
type FetchSink = {next: () => void; complete: () => void; error: () => void}

const mockEvents: string[] = []
const mockJoin: {handlers?: JoinHandlers} = {}
const mockFetch: Partial<FetchSink> = {}
const mockNetwork = {isOffline: false}
function mockGetKey(name: string, variables: unknown) {
  return JSON.stringify({name, variables})
}
const mockAtmosphere = {
  subscriptions: {} as Record<string, unknown>,
  subscriptionAckHandlers: new Map<string, () => void>(),
  records: {} as Record<string, Record<string, unknown>>,
  getStore: () => ({getSource: () => ({get: (dataID: string) => mockAtmosphere.records[dataID]})}),
  isSubscribed: (subKey: string) => Boolean(mockAtmosphere.subscriptions[subKey]),
  retainSubscription: (_subscription: unknown, variables: unknown) => {
    mockEvents.push('subscribe')
    mockAtmosphere.subscriptions[mockGetKey('MeetingSubscription', variables)] = {}
    return () => mockEvents.push('unsubscribe')
  },
  holdSubscription: () => {
    mockEvents.push('hold')
    return () => mockEvents.push('release')
  }
}

jest.mock('../../Atmosphere', () => ({__esModule: true, default: {getKey: mockGetKey}}))
jest.mock('../../subscriptions/MeetingSubscription', () => ({
  __esModule: true,
  default: {key: 'MeetingSubscription'}
}))
jest.mock('../../mutations/JoinMeetingMutation', () => ({
  __esModule: true,
  default: (_atmosphere: unknown, _variables: unknown, handlers: JoinHandlers) => {
    mockEvents.push('join')
    mockJoin.handlers = handlers
  }
}))
jest.mock('react-relay', () => {
  const {Observable: RelayObservable} = jest.requireActual('relay-runtime')
  return {
    fetchQuery: () => ({
      subscribe: (sink: FetchSink) => {
        mockEvents.push('fetch')
        Object.assign(mockFetch, sink)
      }
    }),
    loadQuery: (
      _environment: unknown,
      _query: unknown,
      variables: unknown,
      {fetchPolicy}: {fetchPolicy: string}
    ) => {
      mockEvents.push(`load ${fetchPolicy}`)
      const source =
        fetchPolicy === 'network-only' && mockNetwork.isOffline
          ? RelayObservable.create((sink: {error: (error: Error) => void}) =>
              sink.error(new Error('offline'))
            )
          : undefined
      return {variables, source, isDisposed: false, releaseQuery: () => {}}
    }
  }
})

const environment = new Environment({
  network: Network.create(() => Observable.create(() => {})),
  store: new Store(new RecordSource())
})
const joinedResponse = {joinMeeting: {JoinMeetingMutation_meeting: {meeting: {id: 'meeting1'}}}}
const subKey = mockGetKey('MeetingSubscription', {meetingId: 'meeting1'})

const startJoin = (signal = new AbortController().signal) =>
  joinMeeting(
    mockAtmosphere as unknown as Atmosphere,
    {navigate: async () => {}},
    createQueryRefs(environment, new Set()),
    'meeting1',
    signal
  )

const settle = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}
const completeJoin = () => mockJoin.handlers!.onCompleted(joinedResponse)
const acknowledgeSubscription = () => mockAtmosphere.subscriptionAckHandlers.get(subKey)?.()

beforeAll(() => {
  Object.assign(globalThis, {window: globalThis})
})

beforeEach(() => {
  jest.useFakeTimers()
  mockEvents.length = 0
  mockNetwork.isOffline = false
  mockAtmosphere.subscriptions = {}
  mockAtmosphere.subscriptionAckHandlers.clear()
  mockAtmosphere.records = {}
})

afterEach(() => {
  jest.useRealTimers()
})

test('a viewer not yet in the meeting subscribes after joining, then fetches once the subscription listens', async () => {
  const queryRef = startJoin()
  expect(mockEvents).toEqual(['join'])
  completeJoin()
  expect(mockEvents).toEqual(['join', 'subscribe'])
  acknowledgeSubscription()
  await settle()
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch'])
  mockFetch.complete!()
  expect((await queryRef).variables).toEqual({meetingId: 'meeting1'})
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch', 'release', 'load store-only'])
  expect(getBreadcrumbs().map(({message}) => message)).toEqual(
    expect.arrayContaining([
      'JoinMeetingMutation joined',
      'MeetingSubscription acknowledged',
      'MeetingSelectorQuery fetched'
    ])
  )
})

test('a viewer the store has in the meeting subscribes while joining, then fetches once both are done', async () => {
  mockAtmosphere.records.meeting1 = {viewerMeetingMember: {__ref: 'user1::meeting1'}}
  const queryRef = startJoin()
  expect(mockEvents).toEqual(['subscribe', 'join'])
  acknowledgeSubscription()
  await settle()
  expect(mockEvents).toEqual(['subscribe', 'join', 'hold'])
  completeJoin()
  await settle()
  expect(mockEvents).toEqual(['subscribe', 'join', 'hold', 'fetch'])
  mockFetch.complete!()
  await queryRef
  expect(mockEvents).toEqual(['subscribe', 'join', 'hold', 'fetch', 'release', 'load store-only'])
})

test('the meeting loads from its first payload and holds subscription messages until the last', async () => {
  const queryRef = startJoin()
  completeJoin()
  acknowledgeSubscription()
  await settle()
  mockFetch.next!()
  await queryRef
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch', 'load store-only'])
  mockFetch.next!()
  mockFetch.complete!()
  await settle()
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch', 'load store-only', 'release'])
})

test('a failed fetch loads the meeting from the network, and leaves the meeting if that fails too', async () => {
  mockNetwork.isOffline = true
  const queryRef = startJoin()
  completeJoin()
  acknowledgeSubscription()
  await settle()
  mockFetch.error!()
  await expect(queryRef).rejects.toThrow('offline')
  expect(mockEvents).toEqual([
    'join',
    'subscribe',
    'hold',
    'fetch',
    'release',
    'load network-only',
    'unsubscribe'
  ])
})

test('a navigation abandoned before the join lands leaves the meeting and hands over held messages', async () => {
  mockAtmosphere.records.meeting1 = {viewerMeetingMember: {__ref: 'user1::meeting1'}}
  const navigation = new AbortController()
  startJoin(navigation.signal)
  acknowledgeSubscription()
  navigation.abort()
  await settle()
  expect(mockEvents).toEqual(['subscribe', 'join', 'hold', 'unsubscribe', 'release'])
  expect(mockAtmosphere.subscriptionAckHandlers.has(subKey)).toBe(false)
})

test('the viewer stays joined until the meeting’s page closes', async () => {
  const page = new AbortController()
  const queryRef = startJoin(page.signal)
  completeJoin()
  acknowledgeSubscription()
  await settle()
  mockFetch.complete!()
  await queryRef
  expect(mockEvents).not.toContain('unsubscribe')
  page.abort()
  expect(mockEvents.at(-1)).toBe('unsubscribe')
  expect(mockAtmosphere.subscriptionAckHandlers.has(subKey)).toBe(false)
})
