export type SyncedBlockMenuRow =
  | 'copyAndSync'
  | 'goToOriginal'
  | 'rename'
  | 'duplicatePlain'
  | 'deleteFromPage'

interface Options {
  isOriginal: boolean
  isViewOnly: boolean
  canGoToOriginal: boolean
  isMounted: boolean
}

export const getSyncedBlockMenuRows = (options: Options) => {
  const {isOriginal, isViewOnly, canGoToOriginal, isMounted} = options
  const rows: SyncedBlockMenuRow[] = ['copyAndSync']
  if (canGoToOriginal && !isOriginal) rows.push('goToOriginal')
  if (isViewOnly) return rows
  if (isMounted) rows.push('rename', 'duplicatePlain')
  rows.push('deleteFromPage')
  return rows
}
