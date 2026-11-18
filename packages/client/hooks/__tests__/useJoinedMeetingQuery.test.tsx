import {Window} from 'happy-dom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {MemoryRouter} from 'react-router'
import {getBreadcrumbs} from '../../utils/clientBreadcrumbs'
import useJoinedMeetingQuery from '../useJoinedMeetingQuery'

type JoinHandlers = {onCompleted: (response: unknown) => void; onError: () => void}

const mockEvents: string[] = []
const mockJoin: {handlers?: JoinHandlers} = {}
const mockFetch: {next?: () => void; complete?: () => void} = {}
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
    return () => {}
  },
  holdSubscription: () => {
    mockEvents.push('hold')
    return () => mockEvents.push('release')
  }
}

jest.mock('../useAtmosphere', () => ({__esModule: true, default: () => mockAtmosphere}))
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
  ...jest.requireActual('react-relay'),
  fetchQuery: () => ({
    subscribe: ({next, complete}: {next: () => void; complete: () => void}) => {
      mockEvents.push('fetch')
      mockFetch.next = next
      mockFetch.complete = complete
    }
  }),
  useQueryLoader: () => [null, () => mockEvents.push('load')]
}))

const happyWindow = new Window({url: 'https://parabol.test/'})
const joined = {joinMeeting: {JoinMeetingMutation_meeting: {meeting: {id: 'meeting1'}}}}

const JoinedMeeting = () => {
  useJoinedMeetingQuery('meeting1')
  return null
}

const renderJoinedMeeting = async () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  await act(async () =>
    root.render(
      <MemoryRouter>
        <JoinedMeeting />
      </MemoryRouter>
    )
  )
  return root
}

const completeJoin = () => act(async () => mockJoin.handlers!.onCompleted(joined))

const acknowledgeSubscription = () =>
  act(async () => {
    const subKey = mockGetKey('MeetingSubscription', {meetingId: 'meeting1'})
    mockAtmosphere.subscriptionAckHandlers.get(subKey)?.()
  })

const leaveMeeting = (root: Root) => act(async () => root.unmount())

beforeAll(() => {
  Object.assign(globalThis, {
    window: happyWindow,
    document: happyWindow.document,
    IS_REACT_ACT_ENVIRONMENT: true
  })
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

beforeEach(() => {
  mockEvents.length = 0
  mockAtmosphere.subscriptions = {}
  mockAtmosphere.subscriptionAckHandlers.clear()
  mockAtmosphere.records = {}
})

test('a viewer not yet in the meeting subscribes after joining, then fetches once the subscription listens', async () => {
  const root = await renderJoinedMeeting()
  expect(mockEvents).toEqual(['join'])
  await completeJoin()
  expect(mockEvents).toEqual(['join', 'subscribe'])
  await acknowledgeSubscription()
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch'])
  mockFetch.complete!()
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch', 'load', 'release'])
  await leaveMeeting(root)
})

test('each step of loading the meeting leaves a breadcrumb', async () => {
  const root = await renderJoinedMeeting()
  await completeJoin()
  await acknowledgeSubscription()
  mockFetch.complete!()
  expect(getBreadcrumbs().map(({message}) => message)).toEqual(
    expect.arrayContaining([
      'JoinMeetingMutation joined',
      'MeetingSubscription acknowledged',
      'MeetingSelectorQuery fetched, loaded from the store'
    ])
  )
  await leaveMeeting(root)
})

test('a viewer the store has in the meeting subscribes while joining, then fetches once both are done', async () => {
  mockAtmosphere.records.meeting1 = {viewerMeetingMember: {__ref: 'user1::meeting1'}}
  const root = await renderJoinedMeeting()
  expect(mockEvents).toEqual(['subscribe', 'join'])
  await acknowledgeSubscription()
  expect(mockEvents).toEqual(['subscribe', 'join', 'hold'])
  await completeJoin()
  expect(mockEvents).toEqual(['subscribe', 'join', 'hold', 'fetch'])
  mockFetch.complete!()
  expect(mockEvents).toEqual(['subscribe', 'join', 'hold', 'fetch', 'load', 'release'])
  await leaveMeeting(root)
})

test('leaving before the join lands hands over the held messages without fetching', async () => {
  mockAtmosphere.records.meeting1 = {viewerMeetingMember: {__ref: 'user1::meeting1'}}
  const root = await renderJoinedMeeting()
  await acknowledgeSubscription()
  await leaveMeeting(root)
  expect(mockEvents).toEqual(['subscribe', 'join', 'hold', 'release'])
})

test('the meeting loads from its first payload and holds subscription messages until the last', async () => {
  const root = await renderJoinedMeeting()
  await completeJoin()
  await acknowledgeSubscription()
  mockFetch.next!()
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch', 'load'])
  mockFetch.next!()
  mockFetch.complete!()
  expect(mockEvents).toEqual(['join', 'subscribe', 'hold', 'fetch', 'load', 'release'])
  await leaveMeeting(root)
})
