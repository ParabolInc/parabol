import '../../tiptap/extensions/__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {RelayEnvironmentProvider} from 'react-relay'
import {
  ConnectionHandler,
  Environment,
  type GraphQLResponse,
  Network,
  RecordSource,
  Store
} from 'relay-runtime'
import {useUnsyncSyncedBlockMutation} from '../useUnsyncSyncedBlockMutation'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () =>
    jest.requireActual('../../__generated__/useUnsyncSyncedBlockMutation.graphql').default
}))
jest.mock('../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({eventEmitter: {emit: jest.fn()}})
}))

const viewerId = 'user1'
const pageId = 'page:7'
const archivedConnId = ConnectionHandler.getConnectionID(viewerId, 'User_archivedPages', {
  isArchived: true
})

const createEnvironment = (response: GraphQLResponse) =>
  new Environment({
    network: Network.create(async () => response),
    store: new Store(
      new RecordSource({
        'client:root': {__id: 'client:root', __typename: '__Root', viewer: {__ref: viewerId}},
        [viewerId]: {
          __id: viewerId,
          __typename: 'User',
          id: viewerId,
          [archivedConnId.slice(`client:${viewerId}:`.length)]: {__ref: archivedConnId}
        },
        [archivedConnId]: {
          __id: archivedConnId,
          __typename: 'PageConnection',
          edges: {__refs: []},
          pageInfo: null
        }
      })
    )
  })

const trashedIds = (environment: Environment) => {
  const source = environment.getStore().getSource()
  const edgeRefs = (source.get(archivedConnId)?.edges as {__refs: string[]}).__refs
  return edgeRefs.map((edgeId) => (source.get(edgeId)?.node as {__ref: string}).__ref)
}

const unsyncedPage = {
  id: pageId,
  title: 'Escalation',
  deletedAt: '2026-11-14T00:00:00.000Z',
  deletedBy: viewerId,
  isSyncedBlock: true,
  isPrivate: false,
  parentPageId: 'page:3',
  teamId: null
}

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const runUnsync = async (environment: Environment) => {
  let execute: ReturnType<typeof useUnsyncSyncedBlockMutation>[0] | undefined
  const Probe = () => {
    ;[execute] = useUnsyncSyncedBlockMutation()
    return null
  }
  act(() =>
    root.render(
      <RelayEnvironmentProvider environment={environment}>
        <Probe />
      </RelayEnvironmentProvider>
    )
  )
  await act(
    () =>
      new Promise<void>((resolve) => {
        execute!({variables: {pageId}, onCompleted: () => resolve(), onError: () => resolve()})
      })
  )
}

test('Unsync all puts the block in the Trash list for the person who ran it', async () => {
  const environment = createEnvironment({data: {unsyncSyncedBlock: {page: unsyncedPage}}})
  await runUnsync(environment)
  expect(trashedIds(environment)).toEqual([pageId])
})

test('a refused Unsync all leaves the Trash list alone', async () => {
  const environment = createEnvironment({
    data: {unsyncSyncedBlock: null},
    errors: [{name: 'GraphQLError', message: 'This synced block is already in Trash'}]
  })
  await runUnsync(environment)
  expect(trashedIds(environment)).toEqual([])
})
