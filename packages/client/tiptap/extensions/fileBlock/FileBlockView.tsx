import AudioFileIcon from '@mui/icons-material/AudioFile'
import CodeIcon from '@mui/icons-material/Code'
import DescriptionIcon from '@mui/icons-material/Description'
import FilePresentIcon from '@mui/icons-material/FilePresent'
import ImageIcon from '@mui/icons-material/Image'
import InventoryIcon from '@mui/icons-material/Inventory'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import TableChartIcon from '@mui/icons-material/TableChart'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import {useEventCallback} from '@mui/material'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useEffect} from 'react'
import type {FileBlockAttrs} from '../../../shared/tiptap/extensions/FileBlockBase'
import {formatFileSize} from './formatFileSize'
import {useEmbedNewUserAsset} from './useEmbedNewUserAsset'

const getFileIcon = (fileType: string) => {
  if (fileType.includes('image')) return ImageIcon
  if (fileType.includes('video')) return VideoFileIcon
  if (fileType.includes('audio')) return AudioFileIcon
  if (fileType.includes('pdf')) return PictureAsPdfIcon
  if (fileType.includes('spreadsheet') || fileType.includes('csv') || fileType.includes('excel'))
    return TableChartIcon
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return SlideshowIcon
  if (fileType.includes('word') || fileType.includes('officedocument.wordprocessingml'))
    return DescriptionIcon
  if (fileType.includes('zip') || fileType.includes('archive') || fileType.includes('compressed'))
    return InventoryIcon
  if (fileType.includes('text/plain')) return TextSnippetIcon
  if (
    fileType.includes('javascript') ||
    fileType.includes('typescript') ||
    fileType.includes('json') ||
    fileType.includes('html') ||
    fileType.includes('css')
  )
    return CodeIcon
  return FilePresentIcon
}
export const FileBlockView = (props: NodeViewProps) => {
  const {editor, node, selected, updateAttributes} = props
  const {name, size, src, fileType} = node.attrs as FileBlockAttrs
  const Icon = getFileIcon(fileType)
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
  const {scopeKey, assetScope} = editor.extensionStorage.fileUpload
  const {isHosted} = useEmbedNewUserAsset(src, scopeKey, assetScope, updateAttributes)

  return (
    <NodeViewWrapper>
      <div
        contentEditable={false}
        onClick={onClick}
        data-uploading={isHosted ? undefined : ''}
        className='m-0 block p-0 data-uploading:animate-shimmer data-uploading:[mask:linear-gradient(-60deg,#000_30%,#0005,#000_70%)_right/350%_100%]'
      >
        <div className='flex cursor-pointer items-center rounded-sm bg-slate-200 p-2 text-sm transition-colors hover:bg-slate-300 group-[.ProseMirror-selectednode]:bg-slate-300'>
          <Icon className='mr-2 size-5' />
          <span className='mr-2'>{name}</span>
          <span className='text-slate-600 italic'>{sizelabel}</span>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
