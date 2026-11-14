import type {Editor} from '@tiptap/core'
import {type ComponentType, Fragment} from 'react'
import {useNavigate} from 'react-router'
import {AddToPhotos, ContentCopy, DeleteOutlined, Edit, NorthEast} from '~/ui/icons'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {MENU_ITEM_ICON, MenuItem} from '../../../ui/Menu/MenuItem'
import {MenuSeparator} from '../../../ui/Menu/MenuSeparator'
import {GQLID} from '../../../utils/GQLID'
import {modKey} from '../../../utils/platform'
import {getPageSlug} from '../../getPageSlug'
import {copySyncedBlock} from './copySyncedBlock'
import {deleteSyncedBlockFromPage} from './deleteSyncedBlockFromPage'
import {duplicateSyncedBlockAsPlain} from './duplicateSyncedBlockAsPlain'
import {getSyncedBlockMenuRows, type SyncedBlockMenuRow} from './getSyncedBlockMenuRows'
import {startSyncedBlockRename} from './startSyncedBlockRename'
import {getNestedEditor} from './syncedBlockFocus'

export interface SyncedBlockMenuItemsProps {
  hostEditor: Editor
  pos: number
  pageCode: number
  isOriginal: boolean
  isViewOnly: boolean
  original: {pageId: string; title: string} | null
  currentPageId: string | undefined
  runAfterClose: (action: () => void) => void
}

interface RowItem {
  Icon: ComponentType<{className?: string}>
  label: string
  hint?: string
  onSelect: () => void
}

export const SyncedBlockMenuItems = (props: SyncedBlockMenuItemsProps) => {
  const {hostEditor, pos, pageCode, isOriginal, isViewOnly, original, currentPageId} = props
  const {runAfterClose} = props
  const atmosphere = useAtmosphere()
  const navigate = useNavigate()
  const canGoToOriginal = !!original && original.pageId !== currentPageId
  const rows = getSyncedBlockMenuRows({isOriginal, isViewOnly, canGoToOriginal})
  const thenFocusHost = (action: () => void) =>
    runAfterClose(() => {
      action()
      hostEditor.commands.focus()
    })
  const items: Record<SyncedBlockMenuRow, RowItem> = {
    copyAndSync: {
      Icon: ContentCopy,
      label: 'Copy and sync',
      onSelect: () => {
        const title = hostEditor.state.doc.nodeAt(pos)?.attrs.title ?? ''
        copySyncedBlock({pageCode, title}, getNestedEditor(hostEditor.view, pos), atmosphere)
      }
    },
    goToOriginal: {
      Icon: NorthEast,
      label: 'Go to original',
      onSelect: () => {
        if (!original) return
        const [originalPageCode] = GQLID.fromKey(original.pageId)
        navigate(`/pages/${getPageSlug(originalPageCode, original.title)}`)
      }
    },
    rename: {
      Icon: Edit,
      label: 'Rename',
      onSelect: () => runAfterClose(() => startSyncedBlockRename(hostEditor.view, pos))
    },
    duplicatePlain: {
      Icon: AddToPhotos,
      label: 'Duplicate as plain blocks',
      hint: `${modKey}+D`,
      onSelect: () => thenFocusHost(() => duplicateSyncedBlockAsPlain(hostEditor, pos))
    },
    deleteFromPage: {
      Icon: DeleteOutlined,
      label: 'Delete from this page',
      hint: 'Del',
      onSelect: () => thenFocusHost(() => deleteSyncedBlockFromPage(hostEditor, pos, pageCode))
    }
  }
  return rows.map((row) => {
    const {Icon, label, hint, onSelect} = items[row]
    return (
      <Fragment key={row}>
        {row === 'deleteFromPage' && <MenuSeparator />}
        <MenuItem onSelect={onSelect}>
          <Icon className={MENU_ITEM_ICON} />
          <span className='flex-1 text-left'>{label}</span>
          {hint && <span className='ml-4 text-fg-muted text-xs'>{hint}</span>}
        </MenuItem>
      </Fragment>
    )
  })
}
