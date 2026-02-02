import AttachmentIcon from '@mui/icons-material/Attachment'
import {useEventCallback} from '@mui/material'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useEffect} from 'react'
import type {FileBlockAttrs} from '../../../shared/tiptap/extensions/FileBlockBase'
import {formatFileSize} from './formatFileSize'
export const FileBlockView = (props: NodeViewProps) => {
  const {editor, node, selected} = props
  const {name, size, src} = node.attrs as FileBlockAttrs
  const sizelabel = formatFileSize(size, 2)
  const onClick = async () => {
    const res = await fetch(src)
    const blob = await res.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = name
    link.click()
    window.URL.revokeObjectURL(blobUrl)
  }
  const onEnter = useEventCallback(() => {
    if (selected) {
      onClick()
    }
  })
  useEffect(() => {
    editor.on('enter', onEnter)
    return () => {
      editor.off('enter', onEnter)
    }
  }, [editor])
  return (
    <NodeViewWrapper>
      <div className='m-0 p-0' tabIndex={-1} contentEditable={false} onClick={onClick}>
        <div className='flex cursor-pointer items-center rounded-sm bg-slate-200 p-2 text-sm transition-colors hover:bg-slate-300 group-[.ProseMirror-selectednode]:bg-slate-300'>
          <AttachmentIcon className='mr-2 size-5' />
          <span className='mr-2'>{name}</span>
          <span className='text-slate-600 italic'>{sizelabel}</span>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
