import {commitLocalUpdate, Environment, Network, RecordSource, Store} from 'relay-runtime'
import type {HandleFieldPayload, RecordSourceProxy} from 'relay-runtime/store/RelayStoreTypes'
import type {RegisteredClientIntegration} from '~/integrations/platform/registry'
import {
  EMPTY_SCOPING_SEARCH_STATE,
  type ScopingSearchState
} from '~/integrations/platform/ScopingSearchState'
import LocalPokerHandler from '../LocalPokerHandler'
import readScopingSearchStateFromRelayStore from '../readScopingSearchStateFromRelayStore'
import setScopingSearchStateInRelayStore from '../setScopingSearchStateInRelayStore'

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

const readScopingSearchState = (
  environment: Environment,
  meetingId: string,
  service: RegisteredClientIntegration
) => {
  const result: {state: ScopingSearchState | null} = {state: null}
  commitLocalUpdate(environment, (store) => {
    result.state = readScopingSearchStateFromRelayStore(store, meetingId, service)
  })
  return result.state
}

describe('setScopingSearchStateInRelayStore', () => {
  const meetingId = 'meeting1'

  it('reads the empty state for a service whose search the viewer has not touched', () => {
    const environment = createTestEnvironment()
    seedMeeting(environment, meetingId)

    expect(readScopingSearchState(environment, meetingId, 'jira')).toEqual(
      EMPTY_SCOPING_SEARCH_STATE
    )
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

  it('reads the empty state for a meeting the handler never seeded', () => {
    const environment = createTestEnvironment()
    expect(readScopingSearchState(environment, 'unseeded', 'jira')).toEqual(
      EMPTY_SCOPING_SEARCH_STATE
    )
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
    expect(readScopingSearchState(environment, meetingId, 'github')).toEqual(
      EMPTY_SCOPING_SEARCH_STATE
    )
  })
})
