import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {useLayoutEffect, useRef} from 'react'
import {ContentCopy, DeleteOutlined} from '~/ui/icons'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../../ui/Menu/MenuItem'
import menuSectionTitleClass from '../../ui/Menu/menuSectionTitleClass'
import {modKey} from '../../utils/platform'
import plural from '../../utils/plural'
import {getSelectedBlockRange} from '../blockSelection/blockSelectionState'
import type {BlockRange} from '../blockSelection/blockUnits'
import {deleteBlocks, duplicateBlocks} from './BlockSelection'
import {CalloutStyleSubMenu} from './callout/CalloutStyleSubMenu'
import {deleteSyncedBlockFromPage} from './pageLinkBlock/deleteSyncedBlockFromPage'
import {duplicateSyncedBlockAsPlain} from './pageLinkBlock/duplicateSyncedBlockAsPlain'
import {SyncedBlockMenuRoot} from './pageLinkBlock/SyncedBlockMenuRoot'
import {getNestedEditor} from './pageLinkBlock/syncedBlockFocus'
import {useRunAfterMenuClose} from './pageLinkBlock/useRunAfterMenuClose'
import {TurnIntoMenu} from './turnInto/TurnIntoMenu'
import {getTurnIntoTarget} from './turnInto/turnBlockInto'

interface DragHandleMenuProps {
  editor: Editor
  node: Node
  pos: number
  onClose: () => void
  anchorElement: HTMLElement
  canCreateSubPage: boolean
  selection?: {range: BlockRange; count: number} | null
}

const DragHandleMenu = (props: DragHandleMenuProps) => {
  const {editor, node, pos, onClose, anchorElement, canCreateSubPage, selection} = props
  const triggerRef = useRef<HTMLButtonElement>(null)
  const {runAfterClose, handleCloseAutoFocus} = useRunAfterMenuClose()

  const isCanonicalPageLink = node.type.name === 'pageLinkBlock' && node.attrs.canonical === true
  const isDocumentHeading = pos === 0
  const isSyncedLink = !selection && node.type.name === 'pageLinkBlock' && !!node.attrs.synced
  const isSyncedViewOnly = isSyncedLink && !getNestedEditor(editor.view, pos)?.isEditable
  const pageCode = Number(node.attrs.pageCode)
  const showDelete = !!selection || isSyncedLink || (!isCanonicalPageLink && !isDocumentHeading)
  const turnIntoCurrent =
    selection || isSyncedLink ? null : getTurnIntoTarget(editor.state.doc, pos)
  const blocks = plural(selection?.count ?? 1, 'block')

  useLayoutEffect(() => {
    const trigger = triggerRef.current
    if (!trigger || !anchorElement) return
    const rect = anchorElement.getBoundingClientRect()
    trigger.style.position = 'fixed'
    trigger.style.top = `${rect.top}px`
    trigger.style.left = `${rect.left}px`
    trigger.style.width = `${rect.width}px`
    trigger.style.height = `${rect.height}px`
  }, [anchorElement])

  const runOnSelection = (command: typeof deleteBlocks) => {
    const range = getSelectedBlockRange(editor.state)
    if (range) command({editor, range})
    editor.commands.focus()
  }

  const handleDuplicate = () => {
    if (selection) {
      runOnSelection(duplicateBlocks)
      return
    }
    if (isSyncedLink) {
      duplicateSyncedBlockAsPlain(editor, pos)
      editor.commands.focus()
      return
    }
    const json = node.toJSON()
    if (json.type === 'pageLinkBlock' && json.attrs?.canonical) {
      json.attrs = {...json.attrs, canonical: false}
    }
    editor
      .chain()
      .focus()
      .insertContentAt(pos + node.nodeSize, json)
      .run()
  }

  const handleDelete = () => {
    if (selection) {
      runOnSelection(deleteBlocks)
      return
    }
    if (isSyncedLink) {
      deleteSyncedBlockFromPage(editor, pos, pageCode)
      editor.commands.focus()
      return
    }
    const currentNode = editor.state.doc.nodeAt(pos)
    if (!currentNode || currentNode.type.name !== node.type.name) {
      return
    }
    editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize))
    editor.commands.focus()
  }

  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    const isDeleteKey = e.key === 'Delete' || e.key === 'Backspace'
    const isDuplicateKey = e.key === 'd' && (e.metaKey || e.ctrlKey)
    if (!isDeleteKey && !isDuplicateKey) return
    // left alone these reach the browser, which can go back a page or open a bookmark dialog
    e.preventDefault()
    // keys from the Turn into submenu bubble here through its portal
    if (!e.currentTarget.contains(e.target as HTMLElement)) return
    if (isSyncedViewOnly || (isDeleteKey && !showDelete)) return
    if (isDeleteKey) handleDelete()
    else handleDuplicate()
    queueMicrotask(onClose)
  }

  return (
    <Menu
      open
      modal={false}
      onOpenChange={(open) => {
        if (!open) queueMicrotask(onClose)
      }}
      trigger={
        <button
          ref={triggerRef}
          className='pointer-events-none opacity-0'
          tabIndex={-1}
          aria-hidden
        />
      }
    >
      <MenuContent
        align='start'
        sideOffset={4}
        collisionPadding={8}
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          handleCloseAutoFocus(e)
        }}
        onKeyDown={handleContentKeyDown}
        className='z-50'
      >
        {selection && (
          <div className={menuSectionTitleClass}>
            {selection.count} {blocks}
          </div>
        )}
        {turnIntoCurrent && (
          <TurnIntoMenu
            editor={editor}
            node={node}
            pos={pos}
            current={turnIntoCurrent}
            canCreateSubPage={canCreateSubPage}
          />
        )}
        {!selection && node.type.name === 'callout' && (
          <CalloutStyleSubMenu editor={editor} node={node} pos={pos} onClose={onClose} />
        )}
        {isSyncedLink ? (
          <SyncedBlockMenuRoot
            hostEditor={editor}
            pos={pos}
            pageCode={pageCode}
            isOriginal={isCanonicalPageLink}
            isViewOnly={isSyncedViewOnly}
            currentPageId={editor.storage.pageLinkBlock.pageId}
            runAfterClose={runAfterClose}
          />
        ) : (
          <>
            <MenuItem onSelect={handleDuplicate}>
              <ContentCopy className={MENU_ITEM_ICON} />
              <span className='flex-1 text-left'>Duplicate {blocks}</span>
              <span className='ml-4 text-fg-muted text-xs'>{modKey}+D</span>
            </MenuItem>
            {showDelete && (
              <MenuItem onSelect={handleDelete}>
                <DeleteOutlined className={MENU_ITEM_ICON} />
                <span className='flex-1 text-left'>Delete {blocks}</span>
                <span className='ml-4 text-fg-muted text-xs'>Del</span>
              </MenuItem>
            )}
          </>
        )}
      </MenuContent>
    </Menu>
  )
}

export default DragHandleMenu
