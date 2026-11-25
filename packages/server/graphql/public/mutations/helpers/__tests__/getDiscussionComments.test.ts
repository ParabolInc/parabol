import type {DataLoaderInstance} from '../../../../../dataloader/RootDataLoader'
import {getDiscussionComments} from '../getDiscussionComments'

interface StoredComment {
  id: string
  createdBy: string | null
  createdAt: Date
  isActive: boolean
  isAnonymous: boolean
  plaintextContent: string
  threadParentId: string | null
}

const minute = (offset: number) => new Date(Date.UTC(2026, 10, 24, 12, offset))

const makeComment = (overrides: Partial<StoredComment> & Pick<StoredComment, 'id'>) => ({
  createdBy: 'sally',
  createdAt: minute(0),
  isActive: true,
  isAnonymous: false,
  plaintextContent: overrides.id,
  threadParentId: null,
  ...overrides
})

const users: Record<string, {preferredName: string}> = {
  sally: {preferredName: 'Sally'},
  sam: {preferredName: 'Sam'}
}

const makeDataLoader = (comments: StoredComment[]) =>
  ({
    get: (loaderName: string) => {
      if (loaderName === 'commentsByDiscussionId') {
        return {load: async () => comments}
      }
      if (loaderName === 'users') {
        return {load: async (userId: string) => users[userId] ?? null}
      }
      throw new Error(`Unexpected loader ${loaderName}`)
    }
  }) as unknown as DataLoaderInstance

test('nests replies under their comment in the order they were written', async () => {
  const comments = [
    makeComment({
      id: 'second reply',
      createdAt: minute(3),
      threadParentId: 'parent',
      createdBy: 'sam'
    }),
    makeComment({id: 'parent', createdAt: minute(1)}),
    makeComment({id: 'first reply', createdAt: minute(2), threadParentId: 'parent'}),
    makeComment({id: 'alone', createdAt: minute(4), createdBy: 'sam'})
  ]

  expect(await getDiscussionComments('discussion', makeDataLoader(comments))).toEqual([
    {
      text: 'parent',
      author: 'Sally',
      replies: [
        {text: 'first reply', author: 'Sally'},
        {text: 'second reply', author: 'Sam'}
      ]
    },
    {text: 'alone', author: 'Sam'}
  ])
})

test('leaves out deleted comments, Parabol AI comments and comments with no text', async () => {
  const comments = [
    makeComment({id: 'kept'}),
    makeComment({id: 'deleted', isActive: false}),
    makeComment({id: 'ai', createdBy: 'parabolAIUser'}),
    makeComment({id: 'blank', plaintextContent: '  '})
  ]

  expect(await getDiscussionComments('discussion', makeDataLoader(comments))).toEqual([
    {text: 'kept', author: 'Sally'}
  ])
})

test('masks anonymous authors and authors who no longer exist', async () => {
  const comments = [
    makeComment({id: 'hidden', isAnonymous: true}),
    makeComment({id: 'gone', createdAt: minute(1), createdBy: 'deletedUser'}),
    makeComment({id: 'unknown', createdAt: minute(2), createdBy: null})
  ]

  const result = await getDiscussionComments('discussion', makeDataLoader(comments))

  expect(result.map(({author}) => author)).toEqual(['Anonymous', 'Anonymous', 'Anonymous'])
})

test('shows a reply on its own when the comment it answered was deleted', async () => {
  const comments = [
    makeComment({id: 'parent', isActive: false}),
    makeComment({id: 'orphan', createdAt: minute(1), threadParentId: 'parent'})
  ]

  expect(await getDiscussionComments('discussion', makeDataLoader(comments))).toEqual([
    {text: 'orphan', author: 'Sally'}
  ])
})
