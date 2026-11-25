import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import teamContainerQuery from '../../__generated__/TeamContainerQuery.graphql'
import {createQueryRefs} from '../queryRefs'

interface Sink {
  next: (value: unknown) => void
  complete: () => void
  error: (error: Error) => void
}

interface MockRequest {
  variables: unknown
  isReleased: boolean
  answer: () => void
  fail: () => void
}

const mockRequests: MockRequest[] = []
const mockRefreshedVariables: unknown[] = []

jest.mock('react-relay', () => {
  const {Observable: RelayObservable} = jest.requireActual('relay-runtime')
  return {
    loadQuery: (_environment: unknown, _query: unknown, variables: unknown) => {
      const events: ((sink: Sink) => void)[] = []
      const sinks = new Set<Sink>()
      const emit = (event: (sink: Sink) => void) => {
        events.push(event)
        sinks.forEach(event)
      }
      const request: MockRequest = {
        variables,
        isReleased: false,
        answer: () => {
          emit((sink) => sink.next({data: {}}))
          emit((sink) => sink.complete())
        },
        fail: () => emit((sink) => sink.error(new Error('offline')))
      }
      mockRequests.push(request)
      return {
        variables,
        source: RelayObservable.create((sink: Sink) => {
          events.forEach((event) => event(sink))
          sinks.add(sink)
          return () => sinks.delete(sink)
        }),
        get isDisposed() {
          return request.isReleased
        },
        releaseQuery: () => {
          request.isReleased = true
        }
      }
    }
  }
})

jest.mock('relay-runtime', () => ({
  ...jest.requireActual('relay-runtime'),
  fetchQuery: (_environment: unknown, _query: unknown, variables: unknown) => {
    mockRefreshedVariables.push(variables)
    return {subscribe: () => ({unsubscribe: () => {}})}
  }
}))

const environment = new Environment({
  network: Network.create(() => Observable.from({data: {}})),
  store: new Store(new RecordSource())
})

const createRegistry = () => {
  const reconnectHandlers = new Set<() => void>()
  const queryRefs = createQueryRefs(environment, reconnectHandlers)
  const reconnect = () => reconnectHandlers.forEach((handler) => handler())
  return {queryRefs, reconnect}
}

const loadTeams = (
  queryRefs: ReturnType<typeof createRegistry>['queryRefs'],
  teamIds: string[]
) => {
  const loads = teamIds.map((teamId) => queryRefs.load(teamContainerQuery, {teamId}))
  mockRequests.forEach((request) => request.answer())
  return Promise.all(loads)
}

const releasedTeamIds = () =>
  mockRequests
    .filter((request) => request.isReleased)
    .map((request) => (request.variables as {teamId: string}).teamId)

beforeEach(() => {
  jest.useFakeTimers()
  mockRequests.length = 0
  mockRefreshedVariables.length = 0
})

afterEach(() => {
  jest.useRealTimers()
})

test('a second load of the same variables joins the first request and both resolve on its first payload', async () => {
  const {queryRefs} = createRegistry()
  let isFirstResolved = false
  const firstLoad = queryRefs.load(teamContainerQuery, {teamId: 'team1'}).then((queryRef) => {
    isFirstResolved = true
    return queryRef
  })
  const secondLoad = queryRefs.load(teamContainerQuery, {teamId: 'team1'})
  await Promise.resolve()
  expect(isFirstResolved).toBe(false)
  mockRequests[0]!.answer()
  expect(await firstLoad).toBe(await secondLoad)
  expect(mockRequests).toHaveLength(1)
})

test('an unshown query goes after 30 idle seconds, a closed page’s after 5 minutes, an open page’s never', async () => {
  const {queryRefs} = createRegistry()
  const [, closedPageRef, openPageRef] = await loadTeams(queryRefs, ['unshown', 'closed', 'open'])
  queryRefs.lease(closedPageRef!)()
  queryRefs.lease(openPageRef!)
  jest.advanceTimersByTime(30_000)
  expect(releasedTeamIds()).toEqual(['unshown'])
  jest.advanceTimersByTime(5 * 60_000)
  queryRefs.sweep()
  expect(releasedTeamIds()).toEqual(['unshown', 'closed'])
})

test('beyond 50 idle queries, the longest idle go first', async () => {
  const {queryRefs} = createRegistry()
  const teamIds = Array.from({length: 52}, (_, index) => `team${index}`)
  const queryRefsByTeam = await loadTeams(queryRefs, teamIds)
  queryRefsByTeam.forEach((queryRef) => {
    queryRefs.lease(queryRef)()
    jest.advanceTimersByTime(1)
  })
  queryRefs.sweep()
  expect(releasedTeamIds()).toEqual(['team0', 'team1'])
})

test('network-only joins a request in flight, and a page showing the answered one keeps it until it closes', async () => {
  const {queryRefs} = createRegistry()
  const firstLoad = queryRefs.load(
    teamContainerQuery,
    {teamId: 'team1'},
    {fetchPolicy: 'network-only'}
  )
  queryRefs.load(teamContainerQuery, {teamId: 'team1'}, {fetchPolicy: 'network-only'})
  expect(mockRequests).toHaveLength(1)
  mockRequests[0]!.answer()
  const closePage = queryRefs.lease(await firstLoad)
  queryRefs.load(teamContainerQuery, {teamId: 'team1'}, {fetchPolicy: 'network-only'})
  expect(mockRequests).toHaveLength(2)
  expect(mockRequests[0]!.isReleased).toBe(false)
  closePage()
  expect(mockRequests[0]!.isReleased).toBe(true)
})

test('a load after a failed request starts a new one', async () => {
  const {queryRefs} = createRegistry()
  const failedLoad = queryRefs.load(teamContainerQuery, {teamId: 'team1'})
  mockRequests[0]!.fail()
  await expect(failedLoad).rejects.toThrow('offline')
  queryRefs.load(teamContainerQuery, {teamId: 'team1'})
  expect(mockRequests).toHaveLength(2)
})

test('a reconnect refreshes the queries open pages show, not idle ones or ones their owner fetches', async () => {
  const {queryRefs, reconnect} = createRegistry()
  const [openPageRef] = await loadTeams(queryRefs, ['open', 'idle'])
  const ownedLoad = queryRefs.load(
    teamContainerQuery,
    {teamId: 'owned'},
    {fetchPolicy: 'store-only'}
  )
  mockRequests.at(-1)!.answer()
  queryRefs.lease(openPageRef!)
  queryRefs.lease(await ownedLoad)
  reconnect()
  expect(mockRefreshedVariables).toEqual([{teamId: 'open'}])
})
