import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import {getBreadcrumbs} from '../../utils/clientBreadcrumbs'
import {createJoinedMeetings} from '../joinedMeetings'
import {createQueryRefs} from '../queryRefs'

type JoinHandlers = {onCompleted: (response: unknown) => void; onError: () => void}
type FetchSink = {next: () => void; complete: () => void; error: () => void}

const mockEvents: string[] = []
const mockJoin: {handlers?: JoinHandlers} = {}
const mockFetch: Partial<FetchSink> = {}
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
jest.mock('react-relay', () => ({
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
    return {variables, isDisposed: false, releaseQuery: () => {}}
  }
}))

const environment = new Environment({
  network: Network.create(() => Observable.create(() => {})),
  store: new Store(new RecordSource())
})
const joinedResponse = {joinMeeting: {JoinMeetingMutation_meeting: {meeting: {id: 'meeting1'}}}}
const subKey = mockGetKey('MeetingSubscription', {meetingId: 'meeting1'})

const createRegistry = () =>
  createJoinedMeetings(
    mockAtmosphere as unknown as Atmosphere,
    createQueryRefs(environment, new Set()),
    {navigate: async () => {}}
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
  mockAtmosphere.subscriptions = {}
  mockAtmosphere.subscriptionAckHandlers.clear()
  mockAtmosphere.records = {}
})

afterEach(() => {
  jest.useRealTimers()
})

test('a viewer not yet in the meeting subscribes after joining, then fetches once the subscription listens', async () => {
  const queryRef = createRegistry().join('meeting1', new AbortController().signal)
  await settle()
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
  const queryRef = createRegistry().join('meeting1', new AbortController().signal)
  await settle()
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
  const queryRef = createRegistry().join('meeting1', new AbortController().signal)
  await settle()
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

test('a failed fetch loads the meeting from the network, so its error reaches the page', async () => {
  const queryRef = createRegistry().join('meeting1', new AbortController().signal)
  await settle()
  completeJoin()
  acknowledgeSubscription()
  await settle()
  mockFetch.error!()
  await queryRef
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch', 'release', 'load network-only'])
})

test('a navigation that ends before its page opens leaves the meeting and hands over held messages', async () => {
  mockAtmosphere.records.meeting1 = {viewerMeetingMember: {__ref: 'user1::meeting1'}}
  const navigation = new AbortController()
  createRegistry().join('meeting1', navigation.signal)
  await settle()
  acknowledgeSubscription()
  navigation.abort()
  await settle()
  expect(mockEvents).toEqual(['subscribe', 'join', 'hold', 'unsubscribe', 'release'])
  expect(mockAtmosphere.subscriptionAckHandlers.has(subKey)).toBe(false)
})

test('the loader and the page share one join, which outlasts a StrictMode remount and ends when the page closes', async () => {
  const joinedMeetings = createRegistry()
  const navigation = new AbortController()
  const queryRef = joinedMeetings.join('meeting1', navigation.signal)
  joinedMeetings.join('meeting1', navigation.signal)
  await settle()
  completeJoin()
  acknowledgeSubscription()
  await settle()
  mockFetch.complete!()
  await queryRef
  const closeStrictModePage = joinedMeetings.lease('meeting1')
  closeStrictModePage()
  const closePage = joinedMeetings.lease('meeting1')
  jest.advanceTimersByTime(1)
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch', 'release', 'load store-only'])
  closePage()
  jest.advanceTimersByTime(1)
  navigation.abort()
  expect(mockEvents.filter((event) => event === 'unsubscribe')).toEqual(['unsubscribe'])
})

test('a page that outlived its join joins again', async () => {
  const closePage = createRegistry().lease('meeting1')
  await settle()
  expect(mockEvents).toEqual(['join'])
  closePage()
})
