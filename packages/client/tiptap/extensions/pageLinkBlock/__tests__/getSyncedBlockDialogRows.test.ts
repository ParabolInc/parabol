import {getSyncedBlockDialogRows} from '../getSyncedBlockDialogRows'

type Public = 'viewer' | null

const host = (
  id: string,
  title: string,
  {
    hiddenReaderCount = 0,
    isPublic = null,
    isOriginal = id === 'page:1'
  }: {hiddenReaderCount?: number; isPublic?: Public; isOriginal?: boolean} = {}
) => ({
  isOriginal,
  hiddenReaderCount,
  page: {id, title, access: {public: isPublic}}
})

const blockPage = (
  pages: ReturnType<typeof host>[],
  {hiddenCount = 0, blockPublic = null}: {hiddenCount?: number; blockPublic?: Public} = {}
) => ({
  id: 'page:99',
  access: {public: blockPublic},
  syncedBlockPlacements: {pages, hiddenCount}
})

test('counts every page, hidden ones included', () => {
  const page = blockPage([host('page:1', 'Runbook'), host('page:2', 'Handbook')], {
    hiddenCount: 2
  })
  const result = getSyncedBlockDialogRows(page, 'page:1')
  expect(result.pageCount).toBe(4)
  expect(result.originalTitle).toBe('Runbook')
  expect(result.deleteRows.map((row) => row.title)).toEqual([
    'Runbook',
    'Handbook',
    "2 pages you can't open"
  ])
})

test('tags this page in both row lists', () => {
  const page = blockPage([host('page:1', ''), host('page:2', 'Handbook')])
  const result = getSyncedBlockDialogRows(page, 'page:1')
  expect(result.deleteRows).toEqual([
    {key: 'page:1', icon: 'page', title: '<Untitled>', isThisPage: true},
    {key: 'page:2', icon: 'page', title: 'Handbook', isThisPage: false}
  ])
  expect(result.unsyncRows.map((row) => row.isThisPage)).toEqual([true, false])
})

test('names the original page, not this one', () => {
  const page = blockPage([host('page:1', 'Runbook'), host('page:2', 'Handbook')])
  expect(getSyncedBlockDialogRows(page, 'page:2').originalTitle).toBe('Runbook')
  const untitled = blockPage([host('page:1', ''), host('page:2', 'Handbook')])
  expect(getSyncedBlockDialogRows(untitled, 'page:2').originalTitle).toBe('<Untitled>')
  const noOriginal = blockPage([host('page:2', 'Handbook')], {hiddenCount: 1})
  expect(getSyncedBlockDialogRows(noOriginal, 'page:2').originalTitle).toBeNull()
})

test("keeps text where everyone can read and removes it where readers can't", () => {
  const page = blockPage(
    [
      host('page:1', 'Runbook'),
      host('page:2', 'Handbook', {hiddenReaderCount: 1}),
      host('page:3', 'Checklist', {hiddenReaderCount: 3})
    ],
    {hiddenCount: 1}
  )
  expect(getSyncedBlockDialogRows(page, 'page:1').unsyncRows).toEqual([
    {key: 'page:1', icon: 'page', title: 'Runbook', note: 'Keeps its text', isThisPage: true},
    {
      key: 'page:2',
      icon: 'removed',
      title: 'Handbook',
      note: "Block removed. 1 reader there can't see it.",
      isThisPage: false
    },
    {
      key: 'page:3',
      icon: 'removed',
      title: 'Checklist',
      note: "Block removed. 3 readers there can't see it.",
      isThisPage: false
    },
    {
      key: 'hidden',
      icon: 'locked',
      title: "1 page you can't open",
      note: 'Same rule applies',
      isThisPage: false
    }
  ])
})

test("names a link on a page the block isn't shared with", () => {
  const pages = [
    host('page:1', 'Runbook'),
    host('page:2', 'FAQ', {isPublic: 'viewer'}),
    host('page:3', 'Partners', {hiddenReaderCount: 1, isPublic: 'viewer'})
  ]
  expect(
    getSyncedBlockDialogRows(blockPage(pages), 'page:1').unsyncRows.map(({icon, note}) => ({
      icon,
      note
    }))
  ).toEqual([
    {icon: 'page', note: 'Keeps its text'},
    {icon: 'removed', note: "Block removed. The page is shared by link and the block isn't."},
    {
      icon: 'removed',
      note: "Block removed. 1 reader there can't see it, and the page is shared by link."
    }
  ])
  const sharedBlock = blockPage(
    [host('page:1', 'Runbook'), host('page:2', 'FAQ', {isPublic: 'viewer'})],
    {
      blockPublic: 'viewer'
    }
  )
  expect(getSyncedBlockDialogRows(sharedBlock, 'page:1').unsyncRows[1]).toMatchObject({
    icon: 'page',
    note: 'Keeps its text'
  })
})

test('counts hidden pages without naming them', () => {
  const page = blockPage([host('page:1', 'Runbook')], {hiddenCount: 3})
  const result = getSyncedBlockDialogRows(page, 'page:1')
  expect(result.deleteRows.at(-1)).toEqual({
    key: 'hidden',
    icon: 'locked',
    title: "3 pages you can't open",
    isThisPage: false
  })
  const json = JSON.stringify(result)
  expect(json.match(/page:\d+/g)).toEqual(['page:1', 'page:1'])
  expect(json).not.toContain('page:99')
})
