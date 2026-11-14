import {getSyncedBlockPlaces} from '../getSyncedBlockPlaces'

const page = (id: string, title: string, deletedAt: string | null = null) => ({
  id,
  title,
  deletedAt
})
const data = (pages: {isOriginal: boolean; page: ReturnType<typeof page>}[], hiddenCount = 0) => ({
  pages,
  hiddenCount,
  successor: null
})

test('labels the button by the other pages, hidden ones included', () => {
  const places = getSyncedBlockPlaces(
    data(
      [
        {isOriginal: true, page: page('page:1', 'Runbook')},
        {isOriginal: false, page: page('page:2', 'Handbook')}
      ],
      1
    ),
    'page:2'
  )
  expect(places.label).toBe('Also on 2 pages')
  expect(places.hiddenLabel).toBe("1 page you can't open")
  expect(places.rows.map((r) => [r.title, r.isOriginal, r.isThisPage])).toEqual([
    ['Runbook', true, false],
    ['Handbook', false, true]
  ])
  expect(places.footer).toBe('Access comes from Runbook.')
})

test('says only on this page when nothing else shows the block', () => {
  const places = getSyncedBlockPlaces(
    data([{isOriginal: true, page: page('page:1', 'Runbook')}]),
    'page:1'
  )
  expect(places.label).toBe('Only on this page')
  expect(places.footer).toBe('Use Copy and sync, then paste on another page to share it.')
})

test("tags a trashed original's page and explains what happens next", () => {
  const places = getSyncedBlockPlaces(
    data([
      {isOriginal: true, page: page('page:1', 'Runbook', '2026-11-12')},
      {isOriginal: false, page: page('page:2', 'Handbook')}
    ]),
    'page:2'
  )
  expect(places.rows[0]?.isInTrash).toBe(true)
  expect(places.footer).toBe(
    'Copies keep working. If that page is deleted for good, the copy on this page becomes the original.'
  )
})

test('uses the singular for one other page', () => {
  const places = getSyncedBlockPlaces(
    data([
      {isOriginal: true, page: page('page:1', 'Runbook')},
      {isOriginal: false, page: page('page:2', 'Handbook')}
    ]),
    'page:1'
  )
  expect(places.label).toBe('Also on 1 page')
})

test('has no footer page when the original is hidden', () => {
  const places = getSyncedBlockPlaces(
    data([{isOriginal: false, page: page('page:2', 'Handbook')}], 1),
    'page:2'
  )
  expect(places.original).toBeNull()
  expect(places.hiddenLabel).toBe("1 page you can't open")
  expect(places.footer).toBe('')
})

test('names an untitled page the way a page link does', () => {
  const places = getSyncedBlockPlaces(
    data([
      {isOriginal: true, page: page('page:1', '')},
      {isOriginal: false, page: page('page:2', 'Handbook')}
    ]),
    'page:2'
  )
  expect(places.rows[0]?.title).toBe('<Untitled>')
  expect(places.original).toEqual({pageId: 'page:1', title: '<Untitled>'})
})
