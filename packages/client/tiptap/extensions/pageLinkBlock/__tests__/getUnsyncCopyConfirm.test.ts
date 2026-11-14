import {getUnsyncCopyConfirm} from '../getUnsyncCopyConfirm'

const blockPage = ({
  hiddenReaderCount = 0,
  hostPublic = null,
  blockPublic = null,
  title = 'Q3 Planning'
}: {
  hiddenReaderCount?: number
  hostPublic?: 'viewer' | null
  blockPublic?: 'viewer' | null
  title?: string
}) => ({
  access: {public: blockPublic},
  syncedBlockPlacements: {
    pages: [
      {
        isOriginal: true,
        hiddenReaderCount: 0,
        page: {id: 'page:1', title: 'Runbook', access: {public: null}}
      },
      {
        isOriginal: false,
        hiddenReaderCount,
        page: {id: 'page:2', title, access: {public: hostPublic}}
      }
    ]
  }
})

test("asks before unsyncing when people on this page can't see the block", () => {
  expect(getUnsyncCopyConfirm(blockPage({hiddenReaderCount: 8}), 'page:2')).toEqual({
    kind: 'confirm',
    title: 'Show this text to 8 more people?',
    body: "8 people on Q3 Planning can't see this block today. Unsyncing puts its text on the page, where they can read it."
  })
})

test('uses the singular for one person', () => {
  expect(getUnsyncCopyConfirm(blockPage({hiddenReaderCount: 1}), 'page:2')).toEqual({
    kind: 'confirm',
    title: 'Show this text to 1 more person?',
    body: "1 person on Q3 Planning can't see this block today. Unsyncing puts its text on the page, where they can read it."
  })
})

test('names a link instead of counting it', () => {
  expect(getUnsyncCopyConfirm(blockPage({hostPublic: 'viewer'}), 'page:2')).toEqual({
    kind: 'confirm',
    title: 'Show this text to anyone with the link?',
    body: "Q3 Planning is shared by link, and this block isn't. Unsyncing puts its text on the page, where anyone with the link can read it."
  })
})

test('combines people and a link', () => {
  expect(
    getUnsyncCopyConfirm(blockPage({hiddenReaderCount: 3, hostPublic: 'viewer'}), 'page:2')
  ).toEqual({
    kind: 'confirm',
    title: 'Show this text to 3 more people and anyone with the link?',
    body: "3 people on Q3 Planning can't see this block today, and the page is shared by link. Unsyncing puts its text on the page, where they can read it."
  })
  expect(
    getUnsyncCopyConfirm(blockPage({hiddenReaderCount: 1, hostPublic: 'viewer'}), 'page:2')
  ).toEqual({
    kind: 'confirm',
    title: 'Show this text to 1 more person and anyone with the link?',
    body: "1 person on Q3 Planning can't see this block today, and the page is shared by link. Unsyncing puts its text on the page, where they can read it."
  })
})

test('unsyncs without asking when everyone here can see it', () => {
  expect(getUnsyncCopyConfirm(blockPage({}), 'page:2')).toEqual({kind: 'safe'})
})

test("doesn't ask when the block itself is shared by link", () => {
  expect(
    getUnsyncCopyConfirm(blockPage({hostPublic: 'viewer', blockPublic: 'viewer'}), 'page:2')
  ).toEqual({kind: 'safe'})
})

test('uses <Untitled> for an untitled page', () => {
  expect(getUnsyncCopyConfirm(blockPage({hiddenReaderCount: 2, title: ''}), 'page:2')).toEqual({
    kind: 'confirm',
    title: 'Show this text to 2 more people?',
    body: "2 people on <Untitled> can't see this block today. Unsyncing puts its text on the page, where they can read it."
  })
})

test("can't tell when this page isn't among the places", () => {
  expect(getUnsyncCopyConfirm(blockPage({hiddenReaderCount: 2}), 'page:3')).toEqual({
    kind: 'unknown'
  })
  expect(
    getUnsyncCopyConfirm({access: {public: null}, syncedBlockPlacements: null}, 'page:2')
  ).toEqual({kind: 'unknown'})
  expect(getUnsyncCopyConfirm(blockPage({}), undefined)).toEqual({kind: 'unknown'})
})
