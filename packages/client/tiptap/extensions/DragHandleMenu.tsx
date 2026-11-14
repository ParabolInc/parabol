import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {useLayoutEffect, useRef} from 'react'
import {ArrowForward, ContentCopy, DeleteOutlined} from '~/ui/icons'
import type Atmosphere from '../../Atmosphere'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MENU_ITEM_ICON, MenuItem} from '../../ui/Menu/MenuItem'
import menuSectionTitleClass from '../../ui/Menu/menuSectionTitleClass'
import {modKey} from '../../utils/platform'
import plural from '../../utils/plural'
import {openMoveToPageMenu} from '../blockMove/openMoveToPageMenu'
import {getSelectedBlockRange} from '../blockSelection/blockSelectionState'
import type {BlockRange} from '../blockSelection/blockUnits'
import {deleteBlocks, duplicateBlocks} from './BlockSelection'
import {CalloutStyleSubMenu} from './callout/CalloutStyleSubMenu'
import {findSyncedLinkNear} from './pageLinkBlock/findSyncedLinkNear'
import {SyncedBlockMenuContent} from './pageLinkBlock/SyncedBlockMenuContent'
import {getNestedEditor} from './pageLinkBlock/syncedBlockFocus'
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
  atmosphere: Atmosphere
  pageId: string
}

const DragHandleMenu = (props: DragHandleMenuProps) => {
  const {
    editor,
    node,
    pos,
    onClose,
    anchorElement,
    canCreateSubPage,
    selection,
    atmosphere,
    pageId
  } = props
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isCanonicalPageLink = node.type.name === 'pageLinkBlock' && node.attrs.canonical === true
  const isDocumentHeading = pos === 0
  const isSyncedLink = !selection && node.type.name === 'pageLinkBlock' && !!node.attrs.synced
  const nested = isSyncedLink ? getNestedEditor(editor.view, pos) : null
  const isSyncedMounted = !!nested
  const isSyncedViewOnly = !editor.isEditable || (!!nested && !nested.isEditable)
  const pageCode = Number(node.attrs.pageCode)
  const showDelete = !!selection || (!isCanonicalPageLink && !isDocumentHeading)
  const showMoveTo = !isDocumentHeading && editor.isEditable
  const turnIntoCurrent = selection ? null : getTurnIntoTarget(editor.state.doc, pos)
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

  const handleMoveTo = () => {
    const range = selection?.range ?? {
      from: pos,
      to: pos + node.nodeSize,
      depth: editor.state.doc.resolve(pos).depth
    }
    const {top, left, width, height} = anchorElement.getBoundingClientRect()
    const anchorRect = {top, left, width, height}
    openMoveToPageMenu({editor, range, anchorRect, pageId, atmosphere})
  }

  const handleDelete = () => {
    if (selection) {
      runOnSelection(deleteBlocks)
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
    const isMoveToKey = e.key.toLowerCase() === 'p' && e.shiftKey && (e.metaKey || e.ctrlKey)
    if (!isDeleteKey && !isDuplicateKey && !isMoveToKey) return
    // left alone these reach the browser, which can go back a page or open a bookmark dialog
    e.preventDefault()
    // keys from the Turn into submenu bubble here through its portal
    if (!e.currentTarget.contains(e.target as HTMLElement)) return
    if (isDeleteKey && !showDelete) return
    if (isMoveToKey && !showMoveTo) return
    if (isDeleteKey) handleDelete()
    else if (isMoveToKey) handleMoveTo()
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
      {isSyncedLink ? (
        <SyncedBlockMenuContent
          hostEditor={editor}
          getPos={() => findSyncedLinkNear(editor.state.doc, pos, pageCode)}
          pageCode={pageCode}
          isOriginal={isCanonicalPageLink}
          isViewOnly={isSyncedViewOnly}
          isMounted={isSyncedMounted}
          currentPageId={editor.storage.pageLinkBlock.pageId}
          onClose={() => queueMicrotask(onClose)}
          contentProps={{
            align: 'start',
            sideOffset: 4,
            collisionPadding: 8,
            className: 'z-50',
            onCloseAutoFocus: (e) => e.preventDefault()
          }}
        />
      ) : (
        <MenuContent
          align='start'
          sideOffset={4}
          collisionPadding={8}
          onCloseAutoFocus={(e) => e.preventDefault()}
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
          <MenuItem onSelect={handleDuplicate}>
            <ContentCopy className={MENU_ITEM_ICON} />
            <span className='flex-1 text-left'>Duplicate {blocks}</span>
            <span className='ml-4 text-fg-muted text-xs'>{modKey}+D</span>
          </MenuItem>
          {showMoveTo && (
            <MenuItem onSelect={handleMoveTo}>
              <ArrowForward className={MENU_ITEM_ICON} />
              <span className='flex-1 text-left'>Move to…</span>
              <span className='ml-4 text-fg-muted text-xs'>{modKey}+Shift+P</span>
            </MenuItem>
          )}
          {showDelete && (
            <MenuItem onSelect={handleDelete}>
              <DeleteOutlined className={MENU_ITEM_ICON} />
              <span className='flex-1 text-left'>Delete {blocks}</span>
              <span className='ml-4 text-fg-muted text-xs'>Del</span>
            </MenuItem>
          )}
        </MenuContent>
      )}
    </Menu>
  )
}

export default DragHandleMenu
