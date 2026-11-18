import {
  commitLocalUpdate,
  createOperationDescriptor,
  Environment,
  Network,
  RecordSource,
  Store
} from 'relay-runtime'
import useArchivePageMutation from '../../__generated__/useArchivePageMutation.graphql'
import type Atmosphere from '../../Atmosphere'
import createPageConnection from '../../mutations/__tests__/createPageConnection'
import archivePageNotificationUpdater from '../archivePageNotificationUpdater'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/useArchivePageMutation.graphql').default
}))

const viewerId = 'user1'
const pageId = 'page:1'

type PageLocation = 'shared' | 'archived'

const createEnvironment = (location: PageLocation) => {
  const sharedConn = createPageConnection(
    viewerId,
    'User_sharedPages',
    {parentPageId: null, isPrivate: false},
    location === 'shared' ? [pageId] : []
  )
  const archivedConn = createPageConnection(
    viewerId,
    'User_archivedPages',
    {isArchived: true},
    location === 'archived' ? [pageId] : []
  )
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
        [pageId]: {
          __id: pageId,
          __typename: 'Page',
          id: pageId,
          title: 'Old notes',
          parentPageId: null,
          teamId: null,
          isPrivate: false,
          sortOrder: 'a',
          isSyncedBlock: false,
          deletedAt: location === 'archived' ? '2026-11-15T00:00:00.000Z' : null,
          deletedBy: location === 'archived' ? viewerId : null
        },
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

const receive = (
  environment: Environment,
  payloadPageId: string,
  page: Record<string, unknown> | null
) => {
  const operation = createOperationDescriptor(useArchivePageMutation, {
    pageId: payloadPageId,
    action: 'archive'
  })
  environment.commitPayload(operation, {
    archivePage: {pageId: payloadPageId, page}
  })
  commitLocalUpdate(environment, (store) => {
    const payload = store
      .getRoot()
      .getLinkedRecord('archivePage', {pageId: payloadPageId, action: 'archive'})
    archivePageNotificationUpdater(payload, {store, atmosphere: {} as Atmosphere})
  })
}

const pageFields = (fields: Record<string, unknown>) => ({
  __typename: 'Page',
  id: pageId,
  title: 'Old notes',
  isPrivate: false,
  isSyncedBlock: false,
  sortOrder: 'a',
  parentPageId: null,
  teamId: null,
  deletedAt: null,
  deletedBy: null,
  ...fields
})

describe('archivePageNotificationUpdater', () => {
  it('archive from another tab moves the page from the nav into Trash', () => {
    const {environment, sharedConnId, archivedConnId} = createEnvironment('shared')
    receive(
      environment,
      pageId,
      pageFields({deletedAt: '2026-11-15T00:00:00.000Z', deletedBy: viewerId})
    )
    expect(getConnectionNodeIds(environment, sharedConnId)).toEqual([])
    expect(getConnectionNodeIds(environment, archivedConnId)).toEqual([pageId])
  })

  it('restoring a child whose parent is in Trash puts it at the top of the nav', () => {
    const {environment, sharedConnId, archivedConnId} = createEnvironment('archived')
    commitLocalUpdate(environment, (store) => {
      store.get(pageId)!.setValue('page:0', 'parentPageId')
    })
    receive(environment, pageId, pageFields({parentPageId: null, teamId: null, isPrivate: false}))
    expect(getConnectionNodeIds(environment, sharedConnId)).toEqual([pageId])
    expect(getConnectionNodeIds(environment, archivedConnId)).toEqual([])
  })

  it('Delete forever from another tab clears the Trash row', () => {
    const {environment, sharedConnId, archivedConnId} = createEnvironment('archived')
    receive(environment, pageId, null)
    expect(getConnectionNodeIds(environment, archivedConnId)).toEqual([])
    expect(getConnectionNodeIds(environment, sharedConnId)).toEqual([])
  })

  it("a collaborator's Trash doesn't gain someone else's deleted page", () => {
    const {environment, sharedConnId, archivedConnId} = createEnvironment('shared')
    receive(
      environment,
      pageId,
      pageFields({deletedAt: '2026-11-15T00:00:00.000Z', deletedBy: 'user2'})
    )
    expect(getConnectionNodeIds(environment, sharedConnId)).toEqual([])
    expect(getConnectionNodeIds(environment, archivedConnId)).toEqual([])
  })
})
