interface Placements {
  readonly pages: ReadonlyArray<{
    readonly isOriginal: boolean
    readonly page: {
      readonly id: string
      readonly title: string | null | undefined
      readonly deletedAt: string | null | undefined
    }
  }>
  readonly hiddenCount: number
}

export interface SyncedBlockPlaceRow {
  pageId: string
  title: string
  isOriginal: boolean
  isThisPage: boolean
  isInTrash: boolean
}

export interface SyncedBlockPlaces {
  label: string
  otherCount: number
  rows: SyncedBlockPlaceRow[]
  hiddenLabel: string | null
  footer: string
  original: {pageId: string; title: string} | null
}

const pluralPages = (count: number) => `${count} ${count === 1 ? 'page' : 'pages'}`

const getFooter = (otherCount: number, originalRow: SyncedBlockPlaceRow | undefined) => {
  if (otherCount === 0) return 'Use Copy and sync, then paste on another page to share it.'
  if (!originalRow) return ''
  if (originalRow.isInTrash && !originalRow.isThisPage) {
    return 'Copies keep working. If that page is deleted for good, the copy on this page becomes the original.'
  }
  return `Access comes from ${originalRow.title}.`
}

export const getSyncedBlockPlaces = (
  placements: Placements,
  currentPageId: string | undefined
): SyncedBlockPlaces => {
  const rows = placements.pages.map(({isOriginal, page}) => ({
    pageId: page.id,
    title: page.title || '<Untitled>',
    isOriginal,
    isThisPage: page.id === currentPageId,
    isInTrash: !!page.deletedAt
  }))
  const {hiddenCount} = placements
  const otherCount = rows.filter((row) => !row.isThisPage).length + hiddenCount
  const originalRow = rows.find((row) => row.isOriginal)
  return {
    label: otherCount === 0 ? 'Only on this page' : `Also on ${pluralPages(otherCount)}`,
    otherCount,
    rows,
    hiddenLabel: hiddenCount === 0 ? null : `${pluralPages(hiddenCount)} you can't open`,
    footer: getFooter(otherCount, originalRow),
    original: originalRow ? {pageId: originalRow.pageId, title: originalRow.title} : null
  }
}
