import getKysely from '../postgres/getKysely'
import {CipherId} from '../utils/CipherId'
import {sendPublic, signUp} from './common'

afterAll(async () => {
  await getKysely().destroy()
})

const CREATE_PAGE = `
  mutation CreatePage {
    createPage {
      page {
        id
      }
    }
  }
`

const SHARE_PAGE = `
  mutation UpdatePageAccess($pageId: ID!, $subjectId: ID!) {
    updatePageAccess(pageId: $pageId, subjectType: user, subjectId: $subjectId, role: viewer) {
      page {
        id
      }
    }
  }
`

const LIST_SHARED_PAGES = `
  query ListSharedPages($first: Int!) {
    viewer {
      pages(first: $first, isPrivate: false) {
        edges {
          cursor
          node {
            id
          }
        }
      }
    }
  }
`

test('shared pages listed at the same moment all load, with the sort order that was saved', async () => {
  const [owner, viewer] = await Promise.all([signUp(), signUp()])
  const sharedPageIds: string[] = []
  for (let i = 0; i < 5; i++) {
    const created = await sendPublic({query: CREATE_PAGE, cookie: owner.cookie})
    expect(created.errors).toBeUndefined()
    const pageId = created.data.createPage.page.id as string
    const shared = await sendPublic({
      query: SHARE_PAGE,
      variables: {pageId, subjectId: viewer.userId},
      cookie: owner.cookie
    })
    expect(shared.errors).toBeUndefined()
    sharedPageIds.push(pageId)
  }

  const listings = await Promise.all(
    Array.from({length: 8}, (_, i) =>
      sendPublic({
        query: LIST_SHARED_PAGES,
        variables: {first: i % 2 ? 2 : 100},
        cookie: viewer.cookie
      })
    )
  )

  const saved = await getKysely()
    .selectFrom('PageUserSortOrder')
    .select(['pageId', 'sortOrder'])
    .where('userId', '=', viewer.userId)
    .execute()
  const savedSortOrders = new Map(saved.map(({pageId, sortOrder}) => [pageId, sortOrder]))
  expect(savedSortOrders.size).toBe(sharedPageIds.length)

  for (const listing of listings) {
    expect(listing.errors).toBeUndefined()
    const edges: {cursor: string; node: {id: string}}[] = listing.data.viewer.pages.edges
    for (const {cursor, node} of edges) {
      expect(cursor).toBe(savedSortOrders.get(CipherId.fromClient(node.id)[0]))
    }
  }
})
