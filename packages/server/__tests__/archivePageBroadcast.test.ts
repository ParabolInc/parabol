import {sendPublic, signUp, subscribeToNotifications} from './common'

const ARCHIVE_PAGE_SUBSCRIPTION = `
  subscription ArchivePageBroadcastSubscription {
    notificationSubscription {
      fieldName
      ArchivePagePayload {
        pageId
        page {
          id
        }
      }
    }
  }
`

const ARCHIVE_PAGE_MUTATION = `
  mutation ArchivePageBroadcastMutation($pageId: ID!, $action: ArchivePageActionEnum!) {
    archivePage(pageId: $pageId, action: $action) {
      pageId
    }
  }
`

const setup = async () => {
  const {cookie} = await signUp()
  const token = cookie.split('__Host-Http-authToken=')[1]!.split(';')[0]!
  const created = await sendPublic({
    query: `
      mutation ArchivePageBroadcastCreatePageMutation {
        createPage {
          page {
            id
          }
        }
      }
    `,
    cookie
  })
  expect(created.errors).toBeUndefined()
  const pageId = created.data.createPage.page.id as string
  return {cookie, token, pageId}
}

const archive = async (cookie: string, pageId: string, action: string) => {
  const res = await sendPublic({query: ARCHIVE_PAGE_MUTATION, variables: {pageId, action}, cookie})
  expect(res.errors).toBeUndefined()
}

const waitForArchivePagePayload = async (
  waitFor: Awaited<ReturnType<typeof subscribeToNotifications>>['waitFor'],
  pageId: string
) => {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
  const message = await Promise.race([
    waitFor(
      ({type, payload}) =>
        type === 'next' &&
        payload?.data?.notificationSubscription?.fieldName === 'ArchivePagePayload' &&
        payload.data.notificationSubscription.ArchivePagePayload.pageId === pageId
    ),
    timeout
  ])
  return message?.payload.data.notificationSubscription.ArchivePagePayload ?? null
}

test("Delete forever reaches the owner's other tabs", async () => {
  const {cookie, token, pageId} = await setup()
  await archive(cookie, pageId, 'archive')
  const {socket, waitFor} = await subscribeToNotifications(token, ARCHIVE_PAGE_SUBSCRIPTION)
  await archive(cookie, pageId, 'delete')
  const payload = await waitForArchivePagePayload(waitFor, pageId)
  socket.close()
  expect(payload).toEqual({pageId, page: null})
}, 20_000)

test("moving a page to Trash reaches the owner's other tabs", async () => {
  const {cookie, token, pageId} = await setup()
  const {socket, waitFor} = await subscribeToNotifications(token, ARCHIVE_PAGE_SUBSCRIPTION)
  await archive(cookie, pageId, 'archive')
  const payload = await waitForArchivePagePayload(waitFor, pageId)
  socket.close()
  expect(payload?.page.id).toBe(pageId)
}, 20_000)
