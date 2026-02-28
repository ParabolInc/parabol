import ContentCopy from '@mui/icons-material/ContentCopy'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {useLayoutEffect, useRef} from 'react'
import {modKey} from '../../utils/platform'

interface DragHandleMenuProps {
  editor: Editor
  node: Node
  pos: number
  onClose: () => void
  anchorElement: HTMLElement
}

const ITEM_CLASS =
  'mx-1 flex w-[calc(100%-8px)] cursor-pointer items-center rounded-md px-4 py-1 text-slate-700 text-sm outline-hidden hover:bg-slate-100 focus:bg-slate-100'

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
    <DropdownMenu.Root
      open
      modal={false}
      onOpenChange={(open) => {
        if (!open) queueMicrotask(onClose)
      }}
    >
      <DropdownMenu.Trigger asChild>
        <button
          ref={triggerRef}
          className='pointer-events-none opacity-0'
          tabIndex={-1}
          aria-hidden
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='start'
          sideOffset={4}
          collisionPadding={8}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onKeyDown={handleContentKeyDown}
          className='z-50 min-w-[200px] rounded-md bg-white py-1 shadow-lg outline-hidden data-[side=bottom]:animate-slide-down data-[side=top]:animate-slide-up'
        >
          <DropdownMenu.Item onSelect={handleDuplicate} className={ITEM_CLASS}>
            <ContentCopy className='mr-2 text-base text-slate-600' />
            <span className='flex-1 text-left'>Duplicate block</span>
            <span className='ml-4 text-slate-400 text-xs'>{modKey}+D</span>
          </DropdownMenu.Item>
          {showDelete && (
            <DropdownMenu.Item onSelect={handleDelete} className={ITEM_CLASS}>
              <DeleteOutlined className='mr-2 text-base text-slate-600' />
              <span className='flex-1 text-left'>Delete block</span>
              <span className='ml-4 text-slate-400 text-xs'>Del</span>
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export default DragHandleMenu
