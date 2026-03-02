import ContentCopy from '@mui/icons-material/ContentCopy'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {useLayoutEffect, useRef} from 'react'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {modKey} from '../../utils/platform'

interface DragHandleMenuProps {
  editor: Editor
  node: Node
  pos: number
  onClose: () => void
  anchorElement: HTMLElement
}

const DragHandleMenu = (props: DragHandleMenuProps) => {
  const {editor, node, pos, onClose, anchorElement} = props
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isCanonicalPageLink = node.type.name === 'pageLinkBlock' && node.attrs.canonical === true
  const isDocumentHeading = pos === 1
  const showDelete = !isCanonicalPageLink && !isDocumentHeading

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

  const handleDuplicate = () => {
    const json = node.toJSON()
    if (json.type === 'pageLinkBlock' && json.attrs?.canonical) {
      json.attrs = {...json.attrs, canonical: false}
    }
    editor.commands.insertContentAt(pos + node.nodeSize, json)
  }

  const handleDelete = () => {
    const currentNode = editor.state.doc.nodeAt(pos)
    if (!currentNode || currentNode.type.name !== node.type.name) {
      return
    }
    editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize))
  }

  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Delete' && showDelete) {
      e.preventDefault()
      handleDelete()
      queueMicrotask(onClose)
    }
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
        onCloseAutoFocus={(e) => e.preventDefault()}
        onKeyDown={handleContentKeyDown}
        className='z-50'
      >
        <MenuItem onSelect={handleDuplicate}>
          <ContentCopy className='mr-2 text-base text-slate-600' />
          <span className='flex-1 text-left'>Duplicate block</span>
          <span className='ml-4 text-slate-400 text-xs'>{modKey}+D</span>
        </MenuItem>
        {showDelete && (
          <MenuItem onSelect={handleDelete}>
            <DeleteOutlined className='mr-2 text-base text-slate-600' />
            <span className='flex-1 text-left'>Delete block</span>
            <span className='ml-4 text-slate-400 text-xs'>Del</span>
          </MenuItem>
        )}
      </MenuContent>
    </Menu>
  )
}

export default DragHandleMenu
