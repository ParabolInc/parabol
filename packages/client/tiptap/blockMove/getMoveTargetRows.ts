import stringScore from 'string-score'
import {type BlockDragState, getBlockDropRefusal, type PageRole} from './getBlockDropRefusal'

export type MoveTargetPage = {
  id: string
  title: string | null
  updatedAt: string | null
  parentPageId: string | null
  teamId: string | null
  isPrivate: boolean | null
  isDatabase: boolean | null
  isMeetingTOC: boolean | null
  viewerRole: PageRole
  ancestorIds: readonly string[]
  parentTitle: string | null
}

export type MoveTargetRow = {
  pageId: string
  title: string
  path: string
  refusal: string | null
  isDatabase: boolean
}

type Context = {
  query: string
  sourcePageId: string
  sourceParentPageId: string | null
  teamNames: ReadonlyMap<string, string>
  drag: BlockDragState
}

const getTitle = (page: MoveTargetPage) => page.title || '<Untitled>'

const getRootLabel = (page: MoveTargetPage, teamNames: ReadonlyMap<string, string>) =>
  (page.teamId && teamNames.get(page.teamId)) || (page.isPrivate ? 'Private' : 'Shared')

const getPath = (
  page: MoveTargetPage,
  pagesById: ReadonlyMap<string, MoveTargetPage>,
  teamNames: ReadonlyMap<string, string>
) => {
  const [topAncestorId] = page.ancestorIds
  if (!topAncestorId) return getRootLabel(page, teamNames)
  const topAncestor = pagesById.get(topAncestorId)
  const parentTitle = page.parentTitle === null ? null : page.parentTitle || '<Untitled>'
  return [
    topAncestor && getRootLabel(topAncestor, teamNames),
    parentTitle !== null && page.ancestorIds.length > 1 && '…',
    parentTitle
  ]
    .filter(Boolean)
    .join(' / ')
}

const getRecency = (page: MoveTargetPage) => (page.updatedAt ? Date.parse(page.updatedAt) : 0)

const getRank = (page: MoveTargetPage, sourceParentPageId: string | null) => {
  if (!sourceParentPageId) return 0
  if (page.id === sourceParentPageId) return 2
  if (page.parentPageId === sourceParentPageId) return 1
  return 0
}

export const getMoveTargetRows = (pages: readonly MoveTargetPage[], context: Context) => {
  const {query, sourceParentPageId, teamNames, drag} = context
  const trimmed = query.trim()
  const scored = pages
    .map((page) => ({page, score: trimmed ? stringScore(getTitle(page), trimmed) : 1}))
    .filter(({score}) => score > 0)
  scored.sort((a, b) =>
    trimmed
      ? b.score - a.score || getRecency(b.page) - getRecency(a.page)
      : getRank(b.page, sourceParentPageId) - getRank(a.page, sourceParentPageId) ||
        getRecency(b.page) - getRecency(a.page)
  )
  const pagesById = new Map(pages.map((page) => [page.id, page]))
  const allowed: MoveTargetRow[] = []
  const refused: MoveTargetRow[] = []
  scored.forEach(({page}) => {
    const refusal = getBlockDropRefusal(
      {
        pageId: page.id,
        viewerRole: page.viewerRole,
        isDatabase: page.isDatabase,
        isMeetingTOC: page.isMeetingTOC,
        ancestorPageIds: page.ancestorIds
      },
      drag
    )
    const row: MoveTargetRow = {
      pageId: page.id,
      title: getTitle(page),
      path: getPath(page, pagesById, teamNames),
      refusal,
      isDatabase: !!page.isDatabase
    }
    ;(refusal ? refused : allowed).push(row)
  })
  return {allowed, refused}
}
