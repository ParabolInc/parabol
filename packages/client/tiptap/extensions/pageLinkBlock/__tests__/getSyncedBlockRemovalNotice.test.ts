import {getSyncedBlockPlaces} from '../getSyncedBlockPlaces'
import {getSyncedBlockRemovalNotice} from '../getSyncedBlockRemovalNotice'

const CURRENT_PAGE_ID = 'page:1'

interface NoticeInput {
  isOriginal: boolean
  otherPages: number
  hidden?: number
  successor?: {id: string; title: string} | null
  viewerIsOwner?: boolean
}

const notice = ({
  isOriginal,
  otherPages,
  hidden = 0,
  successor = null,
  viewerIsOwner = true
}: NoticeInput) => {
  const others = Array.from({length: otherPages}, (_, idx) => ({
    isOriginal: !isOriginal && idx === 0,
    page: {id: `page:${idx + 10}`, title: `Other ${idx}`, deletedAt: null}
  }))
  const pages = [
    {isOriginal, page: {id: CURRENT_PAGE_ID, title: 'This page', deletedAt: null}},
    ...others
  ]
  const places = {
    ...getSyncedBlockPlaces({pages, hiddenCount: hidden}, CURRENT_PAGE_ID),
    successor
  }
  const removal = {
    pageCode: 7,
    isOriginal,
    attrs: {pageCode: 7, title: 'Escalation path', canonical: isOriginal, synced: true},
    pos: 1
  }
  return getSyncedBlockRemovalNotice({removal, places, viewerIsOwner})
}

test('a removed copy says how many pages still show it', () => {
  expect(notice({isOriginal: false, otherPages: 2, hidden: 1})).toEqual({
    kind: 'copy',
    message: 'Removed here. Still on 3 pages.',
    undo: 'reinsertCopy'
  })
})

test('a removed original names the page that now holds it', () => {
  const result = notice({
    isOriginal: true,
    otherPages: 1,
    successor: {id: 'page:9', title: 'Handbook'}
  })
  expect(result).toEqual({
    kind: 'original',
    message: 'Removed here. Still on 1 page.',
    link: {pageId: 'page:9', title: 'Handbook', suffix: ' now holds the original.'},
    undo: 'reinsertCopy'
  })
})

test("a removed original drops the link when the successor can't be named", () => {
  expect(notice({isOriginal: true, otherPages: 0, hidden: 2, successor: null})).toMatchObject({
    kind: 'original',
    link: null
  })
})

test('the last reference goes to trash for its owner', () => {
  expect(notice({isOriginal: true, otherPages: 0, viewerIsOwner: true})).toEqual({
    kind: 'trash',
    message: 'Moved to trash',
    undo: 'restore'
  })
})

test('the last reference shows nothing for a non-owner, because the server puts it back', () => {
  expect(notice({isOriginal: true, otherPages: 0, viewerIsOwner: false})).toEqual({kind: 'none'})
})

test('never says oldest copy', () => {
  const all = [
    notice({isOriginal: true, otherPages: 3, successor: {id: 'page:9', title: 'H'}}),
    notice({isOriginal: false, otherPages: 1})
  ]
  expect(JSON.stringify(all)).not.toMatch(/oldest/i)
})
