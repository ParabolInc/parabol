import ContentCopy from '@mui/icons-material/ContentCopy'
import DeleteOutlined from '@mui/icons-material/DeleteOutlined'
import type {Editor} from '@tiptap/core'
import type {Node} from '@tiptap/pm/model'
import {useEffect, useRef} from 'react'

interface DragHandleMenuProps {
  editor: Editor
  node: Node
  pos: number
  onClose: () => void
}

const DragHandleMenu = (props: DragHandleMenuProps) => {
  const {editor, node, pos, onClose} = props
  const menuRef = useRef<HTMLDivElement>(null)

  const isCanonicalPageLink = node.type.name === 'pageLinkBlock' && node.attrs.canonical === true
  const isDocumentHeading = pos === 1
  const showDelete = !isCanonicalPageLink && !isDocumentHeading

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    const handlePointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as globalThis.Node)) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [onClose])

  const handleDuplicate = () => {
    const json = node.toJSON()
    if (json.type === 'pageLinkBlock' && json.attrs?.canonical) {
      json.attrs = {...json.attrs, canonical: false}
    }
    editor.commands.insertContentAt(pos + node.nodeSize, json)
    onClose()
  }

  const handleDelete = () => {
    const currentNode = editor.state.doc.nodeAt(pos)
    if (!currentNode || currentNode.type.name !== node.type.name) {
      onClose()
      return
    }
    editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize))
    onClose()
  }

  return (
    <div ref={menuRef} className='min-w-[200px] rounded-md bg-white py-1 shadow-lg' role='menu'>
      <button
        className='mx-1 flex w-[calc(100%-8px)] cursor-pointer items-center rounded-md px-4 py-1 text-slate-700 text-sm outline-hidden hover:bg-slate-100 focus:bg-slate-100'
        role='menuitem'
        onPointerDown={handleDuplicate}
      >
        <ContentCopy className='mr-2 text-base text-slate-600' />
        Duplicate block
      </button>
      {showDelete && (
        <button
          className='mx-1 flex w-[calc(100%-8px)] cursor-pointer items-center rounded-md px-4 py-1 text-slate-700 text-sm outline-hidden hover:bg-slate-100 focus:bg-slate-100'
          role='menuitem'
          onPointerDown={handleDelete}
        >
          <DeleteOutlined className='mr-2 text-base text-slate-600' />
          Delete block
        </button>
      )}
    </div>
  )
}

export default DragHandleMenu
