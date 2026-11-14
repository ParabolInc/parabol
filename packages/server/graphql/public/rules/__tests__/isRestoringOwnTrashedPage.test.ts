import type {GraphQLResolveInfo} from 'graphql'
import {isRestoringOwnTrashedPage} from '../isRestoringOwnTrashedPage'

type ResolveArgs = Parameters<typeof isRestoringOwnTrashedPage.resolve>

jest.mock('../../../../utils/CipherId', () => ({
  CipherId: {fromClient: (pageId: string) => [Number(pageId.split(':')[1]), 0, 'page']}
}))

const DELETER_ID = 'user-deleter'
const trashedPage = {id: 1, deletedAt: new Date(), deletedBy: DELETER_ID}
const livePage = {id: 2, deletedAt: null, deletedBy: null}
const pagesById = new Map<number, object>([
  [1, trashedPage],
  [2, livePage]
])

const canRestore = (viewerId: string, pageId: string, action: string) => {
  const ctx = {
    authToken: {sub: viewerId},
    dataLoader: {get: () => ({load: async (id: number) => pagesById.get(id)})},
    _shield: {cache: {}}
  } as unknown as ResolveArgs[2]
  const options = {hashFunction: JSON.stringify} as unknown as ResolveArgs[4]
  return isRestoringOwnTrashedPage.resolve(
    {},
    {pageId, action},
    ctx,
    {} as GraphQLResolveInfo,
    options
  )
}

test('whoever trashed a page may restore it', async () => {
  expect(await canRestore(DELETER_ID, 'page:1', 'restore')).toBe(true)
})

test('someone else may not restore it this way', async () => {
  expect(await canRestore('user-other', 'page:1', 'restore')).toBe(false)
})

test('whoever trashed a page may not permanently delete it this way', async () => {
  expect(await canRestore(DELETER_ID, 'page:1', 'delete')).toBe(false)
})

test('a page that is not in the trash cannot be restored this way', async () => {
  expect(await canRestore(DELETER_ID, 'page:2', 'restore')).toBe(false)
})
