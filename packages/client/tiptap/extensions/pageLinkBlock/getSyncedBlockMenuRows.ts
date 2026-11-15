export type SyncedBlockMenuRow =
  | 'copyAndSync'
  | 'goToOriginal'
  | 'rename'
  | 'whoHasAccess'
  | 'duplicatePlain'
  | 'unsyncCopy'
  | 'unsyncAll'
  | 'deleteFromPage'
  | 'deleteAll'

interface Options {
  isOriginal: boolean
  isViewOnly: boolean
  canGoToOriginal: boolean
  isMounted: boolean
  otherCount: number | null
  isOwner: boolean
}

export const getSyncedBlockMenuRows = (options: Options) => {
  const {isOriginal, isViewOnly, canGoToOriginal, isMounted, otherCount, isOwner} = options
  const rows: SyncedBlockMenuRow[] = ['copyAndSync']
  if (canGoToOriginal && !isOriginal) rows.push('goToOriginal')
  if (isViewOnly) return rows
  if (isMounted) rows.push('rename', 'whoHasAccess', 'duplicatePlain')
  const reachesOtherPages = isOriginal && isOwner && !!otherCount
  if (isMounted && !isOriginal) rows.push('unsyncCopy')
  if (reachesOtherPages) rows.push('unsyncAll')
  rows.push('deleteFromPage')
  if (reachesOtherPages) rows.push('deleteAll')
  return rows
}
