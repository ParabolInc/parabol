import getKysely from '../postgres/getKysely'
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
  query ListSharedPages {
    viewer {
      pages(first: 100, isPrivate: false) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`

test('listing shared pages at the same moment never fails', async () => {
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
    Array.from({length: 8}, () => sendPublic({query: LIST_SHARED_PAGES, cookie: viewer.cookie}))
  )

  for (const listing of listings) {
    expect(listing.errors).toBeUndefined()
    const listedIds = listing.data.viewer.pages.edges.map(({node}: {node: {id: string}}) => node.id)
    expect(listedIds.toSorted()).toEqual(sharedPageIds.toSorted())
  }
})
