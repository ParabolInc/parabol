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
}

export const getSyncedBlockMenuRows = ({isOriginal, isViewOnly, canGoToOriginal}: Options) => {
  const rows: SyncedBlockMenuRow[] = ['copyAndSync']
  if (canGoToOriginal && !isOriginal) rows.push('goToOriginal')
  if (!isViewOnly) rows.push('rename', 'duplicatePlain', 'deleteFromPage')
  return rows
}
