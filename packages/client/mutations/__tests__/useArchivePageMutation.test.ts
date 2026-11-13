import {
  ConnectionHandler,
  commitLocalUpdate,
  Environment,
  Network,
  RecordSource,
  Store
} from 'relay-runtime'
import {handleArchivePage} from '../useArchivePageMutation'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/useArchivePageMutation.graphql').default
}))

const viewerId = 'user1'
const pageId = 'page:1'

const createConnection = (key: string, filters: Record<string, unknown>, nodeIds: string[]) => {
  const connId = ConnectionHandler.getConnectionID(viewerId, key, filters)
  const storageKey = connId.slice(`client:${viewerId}:`.length)
  const edgeIds = nodeIds.map((nodeId) => `${connId}:edge:${nodeId}`)
  const records = Object.fromEntries([
    [
      connId,
      {
        __id: connId,
        __typename: 'PageConnection',
        edges: {__refs: edgeIds},
        pageInfo: null
      }
    ],
    ...nodeIds.map((nodeId, idx) => [
      edgeIds[idx],
      {__id: edgeIds[idx], __typename: 'PageEdge', cursor: null, node: {__ref: nodeId}}
    ])
  ])
  return {storageKey, connId, records}
}

const createEnvironment = () => {
  const sharedConn = createConnection(
    'User_sharedPages',
    {parentPageId: null, isPrivate: false},
    []
  )
  const archivedConn = createConnection('User_archivedPages', {isArchived: true}, [pageId])
  const environment = new Environment({
    network: Network.create(async () => ({data: {}})),
    store: new Store(
      new RecordSource({
        'client:root': {
          __id: 'client:root',
          __typename: '__Root',
          viewer: {__ref: viewerId}
        },
        [viewerId]: {
          __id: viewerId,
          __typename: 'User',
          id: viewerId,
          [sharedConn.storageKey]: {__ref: sharedConn.connId},
          [archivedConn.storageKey]: {__ref: archivedConn.connId}
        },
        // the trash list only loads id & title for its pages
        [pageId]: {__id: pageId, __typename: 'Page', id: pageId, title: 'Old notes'},
        ...sharedConn.records,
        ...archivedConn.records
      })
    )
  })
  return {environment, sharedConnId: sharedConn.connId, archivedConnId: archivedConn.connId}
}

const getConnectionNodeIds = (environment: Environment, connId: string) => {
  const source = environment.getStore().getSource()
  const edgeRefs = (source.get(connId)?.edges as {__refs: string[]}).__refs
  return edgeRefs.map((edgeId) => (source.get(edgeId)?.node as {__ref: string}).__ref)
}

describe('handleArchivePage', () => {
  it('does not put a permanently deleted page back in the nav when only the trash list loaded it', () => {
    const {environment, sharedConnId, archivedConnId} = createEnvironment()
    commitLocalUpdate(environment, (store) => {
      handleArchivePage(pageId, {store, isHardDelete: true})
    })
    expect(getConnectionNodeIds(environment, archivedConnId)).toEqual([])
    expect(getConnectionNodeIds(environment, sharedConnId)).toEqual([])
  })
})
