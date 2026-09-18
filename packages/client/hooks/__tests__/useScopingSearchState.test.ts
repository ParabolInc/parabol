import {commitLocalUpdate, Environment, Network, RecordSource, Store} from 'relay-runtime'
import type {HandleFieldPayload, RecordSourceProxy} from 'relay-runtime/store/RelayStoreTypes'
import LocalPokerHandler from '~/utils/relay/LocalPokerHandler'
import {readScopingSearchState, setScopingSearchStateInRelayStore} from '../useScopingSearchState'

const createTestEnvironment = () =>
  new Environment({
    network: Network.create(() => {
      throw new Error('network should not be used in this test')
    }),
    store: new Store(new RecordSource())
  })

const seedMeeting = (environment: Environment, meetingId: string) => {
  commitLocalUpdate(environment, (store: RecordSourceProxy) => {
    store.create(meetingId, 'PokerMeeting')
    const payload: HandleFieldPayload = {
      args: {},
      dataID: meetingId,
      fieldKey: 'init',
      handle: 'localPoker',
      handleKey: 'init'
    }
    LocalPokerHandler.update(store, payload)
  })
}

describe('useScopingSearchState', () => {
  const meetingId = 'meeting1'

  it('reads null for a service whose search the viewer has not touched', () => {
    const environment = createTestEnvironment()
    seedMeeting(environment, meetingId)

    expect(readScopingSearchState(environment, meetingId, 'jira')).toBeNull()
  })

  it('lists a service on the meeting the first time its search state is written', () => {
    const environment = createTestEnvironment()
    seedMeeting(environment, meetingId)

    commitLocalUpdate(environment, (store) => {
      setScopingSearchStateInRelayStore(store, meetingId, 'jira', {queryString: 'first'})
      setScopingSearchStateInRelayStore(store, meetingId, 'jira', {queryString: 'second'})
    })

    commitLocalUpdate(environment, (store) => {
      const services = store
        .get(meetingId)
        ?.getLinkedRecords('scopingSearchQueries')
        ?.map((searchQuery) => searchQuery.getValue('service'))
      expect(services).toEqual(['jira'])
    })
  })

  it('round-trips filters written through the setter', () => {
    const environment = createTestEnvironment()
    seedMeeting(environment, meetingId)

    commitLocalUpdate(environment, (store) => {
      setScopingSearchStateInRelayStore(store, meetingId, 'jira', {
        queryString: 'is:open',
        isAdvancedQuery: true,
        filters: [{key: 'project', value: 'ABC'}]
      })
    })

    expect(readScopingSearchState(environment, meetingId, 'jira')).toEqual({
      queryString: 'is:open',
      isAdvancedQuery: true,
      filters: [{key: 'project', value: 'ABC'}]
    })
  })

  it('leaves existing filters untouched when a patch omits them', () => {
    const environment = createTestEnvironment()
    seedMeeting(environment, meetingId)

    commitLocalUpdate(environment, (store) => {
      setScopingSearchStateInRelayStore(store, meetingId, 'jira', {
        filters: [{key: 'project', value: 'ABC'}]
      })
    })
    commitLocalUpdate(environment, (store) => {
      setScopingSearchStateInRelayStore(store, meetingId, 'jira', {queryString: 'updated'})
    })

    expect(readScopingSearchState(environment, meetingId, 'jira')).toEqual({
      queryString: 'updated',
      isAdvancedQuery: false,
      filters: [{key: 'project', value: 'ABC'}]
    })
  })

  it('clears filters when a patch sets an empty array', () => {
    const environment = createTestEnvironment()
    seedMeeting(environment, meetingId)

    commitLocalUpdate(environment, (store) => {
      setScopingSearchStateInRelayStore(store, meetingId, 'jira', {
        filters: [{key: 'project', value: 'ABC'}]
      })
    })
    commitLocalUpdate(environment, (store) => {
      setScopingSearchStateInRelayStore(store, meetingId, 'jira', {filters: []})
    })

    expect(readScopingSearchState(environment, meetingId, 'jira')).toMatchObject({filters: []})
  })

  it('reads null for a meeting the handler never seeded', () => {
    const environment = createTestEnvironment()
    expect(readScopingSearchState(environment, 'unseeded', 'jira')).toBeNull()
  })

  it('keeps jira and github state independent', () => {
    const environment = createTestEnvironment()
    seedMeeting(environment, meetingId)

    commitLocalUpdate(environment, (store) => {
      setScopingSearchStateInRelayStore(store, meetingId, 'jira', {
        queryString: 'jira query',
        filters: [{key: 'project', value: 'JIRA-1'}]
      })
    })

    expect(readScopingSearchState(environment, meetingId, 'jira')).toMatchObject({
      queryString: 'jira query'
    })
    expect(readScopingSearchState(environment, meetingId, 'github')).toBeNull()
  })
})
