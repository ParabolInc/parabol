import mockPageFragment from '../../../__generated__/getSearchResultHref_page.graphql'
import {getPageSlug} from '../../../tiptap/getPageSlug'
import {getSearchResultHref} from '../getSearchResultHref'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => mockPageFragment}))
jest.mock('relay-runtime', () => ({
  ...jest.requireActual('relay-runtime'),
  readInlineData: (_fragment: unknown, ref: unknown) => ref
}))

type PageRef = Parameters<typeof getSearchResultHref>[0]
type Placement = {
  isOriginal: boolean
  page: {id: string; title: string; isSyncedBlock: boolean; deletedAt: string | null}
}

const host = (
  code: number,
  title: string,
  isOriginal: boolean,
  overrides: Partial<Placement['page']> = {}
): Placement => ({
  isOriginal,
  page: {id: `page:${code}`, title, isSyncedBlock: false, deletedAt: null, ...overrides}
})

const block = (placements: Placement[]) =>
  ({
    id: 'page:9',
    title: 'Escalation path',
    isSyncedBlock: true,
    syncedBlockPlacements: {pages: placements}
  }) as unknown as PageRef

test('an ordinary page opens itself', () => {
  const page = {
    id: 'page:7',
    title: 'Runbook',
    isSyncedBlock: false,
    syncedBlockPlacements: null
  } as unknown as PageRef
  expect(getSearchResultHref(page)).toBe(`/pages/${getPageSlug(7, 'Runbook')}`)
})

test("a synced block opens its original's page at the block", () => {
  const href = getSearchResultHref(block([host(12, 'Handbook', false), host(7, 'Runbook', true)]))
  expect(href).toBe(`/pages/${getPageSlug(7, 'Runbook')}#synced-block-9`)
})

test('skips an original in Trash for an open copy', () => {
  const href = getSearchResultHref(
    block([host(7, 'Runbook', true, {deletedAt: '2026-11-01'}), host(12, 'Handbook', false)])
  )
  expect(href).toBe(`/pages/${getPageSlug(12, 'Handbook')}#synced-block-9`)
})

test('never routes to a host that is itself a block', () => {
  const href = getSearchResultHref(block([host(12, 'Other block', true, {isSyncedBlock: true})]))
  expect(href).toBe(`/pages/${getPageSlug(9, 'Escalation path')}`)
})

test('falls back to the block page when no host is open', () => {
  expect(getSearchResultHref(block([]))).toBe(`/pages/${getPageSlug(9, 'Escalation path')}`)
})
