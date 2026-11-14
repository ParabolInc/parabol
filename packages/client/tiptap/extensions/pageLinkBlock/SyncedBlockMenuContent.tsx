import type {Editor} from '@tiptap/core'
import {type ComponentProps, type KeyboardEvent, useState} from 'react'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {getSyncedBlockMenuRows, type SyncedBlockMenuRow} from './getSyncedBlockMenuRows'
import {SyncedBlockMenuItems} from './SyncedBlockMenuItems'
import {SyncedBlockMenuRoot} from './SyncedBlockMenuRoot'
import {useRunAfterMenuClose} from './useRunAfterMenuClose'
import {type SyncedBlockOriginal, useSyncedBlockMenuActions} from './useSyncedBlockMenuActions'

type ContentProps = Pick<
  ComponentProps<typeof MenuContent>,
  'align' | 'sideOffset' | 'collisionPadding' | 'className' | 'onCloseAutoFocus'
>

interface Props {
  hostEditor: Editor
  getPos: () => number | undefined
  pageCode: number
  isOriginal: boolean
  isViewOnly: boolean
  isMounted: boolean
  currentPageId: string | undefined
  onClose: () => void
  contentProps: ContentProps
}

const getShortcutRow = (event: KeyboardEvent): SyncedBlockMenuRow | null => {
  if (event.key === 'Delete' || event.key === 'Backspace') return 'deleteFromPage'
  if (event.key === 'd' && (event.metaKey || event.ctrlKey)) return 'duplicatePlain'
  return null
}

export const SyncedBlockMenuContent = (props: Props) => {
  const {hostEditor, getPos, pageCode, isOriginal, isViewOnly, isMounted, currentPageId} = props
  const {onClose, contentProps} = props
  const [original, setOriginal] = useState<SyncedBlockOriginal | null>(null)
  const {runAfterClose, handleCloseAutoFocus} = useRunAfterMenuClose()
  const actions = useSyncedBlockMenuActions({hostEditor, getPos, pageCode, original, runAfterClose})
  const canGoToOriginal = !!original && original.pageId !== currentPageId
  const rows = getSyncedBlockMenuRows({isOriginal, isViewOnly, canGoToOriginal, isMounted})
  const handleKeyDown = (event: KeyboardEvent) => {
    const row = getShortcutRow(event)
    if (!row) return
    event.preventDefault()
    if (!rows.includes(row)) return
    actions[row]()
    onClose()
  }
  return (
    <MenuContent
      {...contentProps}
      onCloseAutoFocus={(event) => {
        contentProps.onCloseAutoFocus?.(event)
        handleCloseAutoFocus(event)
      }}
      onKeyDown={handleKeyDown}
    >
      <SyncedBlockMenuItems rows={rows} actions={actions} />
      <SyncedBlockMenuRoot
        pageCode={pageCode}
        currentPageId={currentPageId}
        onOriginal={setOriginal}
      />
    </MenuContent>
  )
}
