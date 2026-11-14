import {getMoveTargetRows, type MoveTargetPage} from '../getMoveTargetRows'

const page = (title: string, overrides: Partial<MoveTargetPage> = {}): MoveTargetPage => ({
  id: `page:${title}`,
  title,
  updatedAt: '2026-06-01',
  parentPageId: null,
  teamId: null,
  isPrivate: false,
  isDatabase: false,
  isMeetingTOC: false,
  viewerRole: 'owner',
  ancestorIds: [],
  parentTitle: null,
  ...overrides
})

const ctx = (overrides: Partial<Parameters<typeof getMoveTargetRows>[1]> = {}) => ({
  query: '',
  sourcePageId: 'page:Source',
  sourceParentPageId: null,
  teamNames: new Map<string, string>(),
  drag: {sourcePageId: 'page:Source', childPageIds: [], refusal: null},
  ...overrides
})

test('empty query: parent, then siblings, then most recently updated', () => {
  const rows = getMoveTargetRows(
    [
      page('old', {updatedAt: '2026-01-01'}),
      page('sib', {parentPageId: 'page:P'}),
      page('P'),
      page('new', {updatedAt: '2026-11-01'})
    ],
    ctx({sourceParentPageId: 'page:P'})
  )
  expect(rows.allowed.map((r) => r.title)).toEqual(['P', 'sib', 'new', 'old'])
})

test('without a source parent, order is most recently updated', () => {
  const rows = getMoveTargetRows(
    [page('old', {updatedAt: '2026-01-01'}), page('new', {updatedAt: '2026-11-01'})],
    ctx()
  )
  expect(rows.allowed.map((r) => r.title)).toEqual(['new', 'old'])
})

test('a query ranks by title match and drops non-matches', () => {
  const rows = getMoveTargetRows(
    [page('Zero-roster'), page('Q3 Roadmap'), page('Budget')],
    ctx({query: 'ro'})
  )
  expect(rows.allowed.map((r) => r.title)).toEqual(['Q3 Roadmap', 'Zero-roster'])
})

test('refused pages come back separately with their reason', () => {
  const rows = getMoveTargetRows(
    [
      page('Source'),
      page('Design review', {viewerRole: 'viewer'}),
      page('Roadmap bugs', {isDatabase: true}),
      page('Fine')
    ],
    ctx()
  )
  expect(rows.allowed.map((r) => r.title)).toEqual(['Fine'])
  expect(rows.refused.map((r) => [r.title, r.refusal])).toEqual([
    ['Source', 'This page'],
    ['Design review', 'View only'],
    ['Roadmap bugs', 'Database']
  ])
  expect(rows.refused[2]!.isDatabase).toBe(true)
})

test('a page under a moved child page is refused as Inside itself', () => {
  const rows = getMoveTargetRows(
    [page('Deep', {ancestorIds: ['page:7']})],
    ctx({drag: {sourcePageId: 'page:Source', childPageIds: ['page:7'], refusal: null}})
  )
  expect(rows.refused.map((r) => r.refusal)).toEqual(['Inside itself'])
})

test('an empty title shows as the sidebar fallback', () => {
  const rows = getMoveTargetRows([page('x', {title: null}), page('y', {title: ''})], ctx())
  expect(rows.allowed.map((r) => r.title)).toEqual(['<Untitled>', '<Untitled>'])
})

test('a top-level page shows its own team, private or shared root', () => {
  const rows = getMoveTargetRows(
    [
      page('a', {teamId: 'team1', updatedAt: '2026-05-05'}),
      page('d', {isPrivate: true, updatedAt: '2026-05-02'}),
      page('e', {updatedAt: '2026-05-01'})
    ],
    ctx({teamNames: new Map([['team1', 'Engineering']])})
  )
  expect(rows.allowed.map((r) => r.path)).toEqual(['Engineering', 'Private', 'Shared'])
})

test('a child page takes its root from its top-most ancestor', () => {
  const rows = getMoveTargetRows(
    [
      page('Q3 Roadmap', {teamId: 'team1', updatedAt: '2026-05-05'}),
      page('Notes', {isPrivate: true, updatedAt: '2026-05-04'}),
      page('b', {
        parentTitle: 'Q3 Roadmap',
        ancestorIds: ['page:Q3 Roadmap'],
        updatedAt: '2026-05-03'
      }),
      page('c', {
        parentTitle: 'Milestones',
        ancestorIds: ['page:Q3 Roadmap', 'page:Milestones'],
        updatedAt: '2026-05-02'
      }),
      page('f', {parentTitle: 'Notes', ancestorIds: ['page:Notes'], updatedAt: '2026-05-01'})
    ],
    ctx({teamNames: new Map([['team1', 'Engineering']])})
  )
  expect(rows.allowed.map((r) => [r.title, r.path])).toEqual([
    ['Q3 Roadmap', 'Engineering'],
    ['Notes', 'Private'],
    ['b', 'Engineering / Q3 Roadmap'],
    ['c', 'Engineering / … / Milestones'],
    ['f', 'Private / Notes']
  ])
})

test('a child page whose top-most ancestor is not listed shows only its parent', () => {
  const rows = getMoveTargetRows(
    [
      page('b', {parentTitle: 'Q3 Roadmap', ancestorIds: ['page:gone'], updatedAt: '2026-05-02'}),
      page('c', {
        parentTitle: '',
        ancestorIds: ['page:gone', 'page:s'],
        updatedAt: '2026-05-01'
      })
    ],
    ctx({teamNames: new Map([['team1', 'Engineering']])})
  )
  expect(rows.allowed.map((r) => r.path)).toEqual(['Q3 Roadmap', '… / <Untitled>'])
})
