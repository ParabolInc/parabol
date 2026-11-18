interface DialogPage {
  readonly access: {readonly public: string | null | undefined}
  readonly syncedBlockPlacements:
    | {
        readonly pages: ReadonlyArray<{
          readonly isOriginal: boolean
          readonly hiddenReaderCount: number
          readonly page: {
            readonly id: string
            readonly title: string | null | undefined
            readonly access: {readonly public: string | null | undefined}
          }
        }>
        readonly hiddenCount: number
      }
    | null
    | undefined
}

export type SyncedBlockDialogRowIcon = 'page' | 'removed' | 'locked'

export interface SyncedBlockDialogRows {
  pageCount: number
  originalTitle: string | null
  deleteRows: {key: string; icon: 'page' | 'locked'; title: string; isThisPage: boolean}[]
  unsyncRows: {
    key: string
    icon: SyncedBlockDialogRowIcon
    title: string
    note: string
    isThisPage: boolean
  }[]
}

const readersThere = (count: number) =>
  `${count === 1 ? '1 reader' : `${count} readers`} there can't see it`

const getUnsyncNote = (hiddenReaderCount: number, isLinkOnly: boolean) => {
  if (hiddenReaderCount === 0 && !isLinkOnly) return 'Keeps its text'
  if (hiddenReaderCount === 0)
    return "Block removed. The page is shared by link and the block isn't."
  if (!isLinkOnly) return `Block removed. ${readersThere(hiddenReaderCount)}.`
  return `Block removed. ${readersThere(hiddenReaderCount)}, and the page is shared by link.`
}

export const getSyncedBlockDialogRows = (
  page: DialogPage,
  currentPageId: string | undefined
): SyncedBlockDialogRows => {
  const placements = page.syncedBlockPlacements?.pages ?? []
  const hiddenCount = page.syncedBlockPlacements?.hiddenCount ?? 0
  const rows = placements.map((placement) => ({
    key: placement.page.id,
    title: placement.page.title || '<Untitled>',
    isThisPage: placement.page.id === currentPageId,
    isOriginal: placement.isOriginal,
    hiddenReaderCount: placement.hiddenReaderCount,
    isLinkOnly: !!placement.page.access.public && !page.access.public
  }))
  const hiddenTitle = `${hiddenCount} ${hiddenCount === 1 ? 'page' : 'pages'} you can't open`
  const hiddenRow = {key: 'hidden', title: hiddenTitle, isThisPage: false}
  const hasHidden = hiddenCount > 0
  return {
    pageCount: rows.length + hiddenCount,
    originalTitle: rows.find((row) => row.isOriginal)?.title ?? null,
    deleteRows: [
      ...rows.map(({key, title, isThisPage}) => ({key, icon: 'page' as const, title, isThisPage})),
      ...(hasHidden ? [{...hiddenRow, icon: 'locked' as const}] : [])
    ],
    unsyncRows: [
      ...rows.map(({key, title, isThisPage, hiddenReaderCount, isLinkOnly}) => ({
        key,
        icon: hiddenReaderCount === 0 && !isLinkOnly ? ('page' as const) : ('removed' as const),
        title,
        note: getUnsyncNote(hiddenReaderCount, isLinkOnly),
        isThisPage
      })),
      ...(hasHidden ? [{...hiddenRow, icon: 'locked' as const, note: 'Same rule applies'}] : [])
    ]
  }
}
