import '../../__tests__/installHappyDom'
import type {Editor} from '@tiptap/core'
import type Atmosphere from '../../../../Atmosphere'
import {requestSyncedBlockUnsyncCopy} from '../requestSyncedBlockUnsyncCopy'
import {findLinkPositions, mountHost, mountNested, syncedLink} from './syncedBlockTestHarness'

const mockFetch = jest.fn()
jest.mock('relay-runtime', () => ({
  ...jest.requireActual('relay-runtime'),
  fetchQuery: () => ({toPromise: mockFetch}),
  readInlineData: (_fragment: unknown, ref: unknown) => ref
}))

const syncedCopy = {...syncedLink, attrs: {...syncedLink.attrs, canonical: false}}

const blockPage = (hiddenReaderCount: number, hostId = 'page:1') => ({
  public: {
    page: {
      access: {public: null},
      syncedBlockPlacements: {
        pages: [
          {
            isOriginal: false,
            hiddenReaderCount,
            page: {id: hostId, title: 'Q3 Planning', access: {public: null}}
          }
        ],
        hiddenCount: 0
      }
    }
  }
})

const setup = () => {
  const host = mountHost([{type: 'paragraph'}, syncedCopy])
  host.storage.pageLinkBlock = {...host.storage.pageLinkBlock, pageId: 'page:1'}
  mountNested(host, findLinkPositions(host)[0]!, ['Sev 1: page the on-call lead.'])
  const emit = jest.fn()
  const atmosphere = {eventEmitter: {emit}} as unknown as Atmosphere
  const onConfirmNeeded = jest.fn()
  const request = () =>
    requestSyncedBlockUnsyncCopy({
      atmosphere,
      hostEditor: host,
      getPos: () => findLinkPositions(host)[0],
      pageCode: 7,
      onConfirmNeeded
    })
  return {host, emit, onConfirmNeeded, request}
}

const snackMessages = (emit: jest.Mock) =>
  emit.mock.calls.filter(([name]) => name === 'addSnackbar').map(([, snack]) => snack.message)

const linkCount = (host: Editor) => findLinkPositions(host).length

test('unsyncs at once when nobody new would see the text', async () => {
  const {host, emit, onConfirmNeeded, request} = setup()
  mockFetch.mockResolvedValueOnce(blockPage(0))
  await request()
  expect(onConfirmNeeded).not.toHaveBeenCalled()
  expect(linkCount(host)).toBe(0)
  expect(snackMessages(emit)).toEqual(['This copy now has its own text.'])
})

test('asks first when someone new would see the text', async () => {
  const {host, onConfirmNeeded, request} = setup()
  mockFetch.mockResolvedValueOnce(blockPage(2))
  await request()
  expect(onConfirmNeeded).toHaveBeenCalledWith({
    title: 'Show this text to 2 more people?',
    body: "2 people on Q3 Planning can't see this block today. Unsyncing puts its text on the page, where they can read it."
  })
  expect(linkCount(host)).toBe(1)
})

test("says it couldn't unsync and changes nothing when the check fails", async () => {
  const {host, emit, onConfirmNeeded, request} = setup()
  mockFetch.mockRejectedValueOnce(new Error('offline'))
  await request()
  mockFetch.mockResolvedValueOnce({
    public: {page: {access: {public: null}, syncedBlockPlacements: null}}
  })
  await request()
  expect(onConfirmNeeded).not.toHaveBeenCalled()
  expect(linkCount(host)).toBe(1)
  expect(snackMessages(emit)).toEqual([
    "Couldn't unsync this copy. Try again.",
    "Couldn't unsync this copy. Try again."
  ])
})

test("says it couldn't unsync and changes nothing when this page is not among the places", async () => {
  const {host, emit, onConfirmNeeded, request} = setup()
  mockFetch.mockResolvedValueOnce(blockPage(0, 'page:2'))
  await request()
  expect(onConfirmNeeded).not.toHaveBeenCalled()
  expect(linkCount(host)).toBe(1)
  expect(snackMessages(emit)).toEqual(["Couldn't unsync this copy. Try again."])
})
