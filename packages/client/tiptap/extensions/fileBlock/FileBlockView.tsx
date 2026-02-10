import AudioFileIcon from '@mui/icons-material/AudioFile'
import CodeIcon from '@mui/icons-material/Code'
import DescriptionIcon from '@mui/icons-material/Description'
import EditIcon from '@mui/icons-material/Edit'
import FilePresentIcon from '@mui/icons-material/FilePresent'
import ImageIcon from '@mui/icons-material/Image'
import InventoryIcon from '@mui/icons-material/Inventory'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import SlideshowIcon from '@mui/icons-material/Slideshow'
import TableChartIcon from '@mui/icons-material/TableChart'
import TextSnippetIcon from '@mui/icons-material/TextSnippet'
import VideoFileIcon from '@mui/icons-material/VideoFile'
import {useEventCallback} from '@mui/material'
import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useEffect, useRef, useState} from 'react'
import type {FileBlockAttrs} from '../../../shared/tiptap/extensions/FileBlockBase'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
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
  const [isEditing, setIsEditing] = useState(false)
  const [fileName, setFileName] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  const onClick = async () => {
    if (isEditing) return
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
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleRename = () => {
    if (fileName.trim()) {
      updateAttributes({name: fileName})
    } else {
      setFileName(name) // Revert if empty
    }
    setIsEditing(false)
  }

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
        <div className='group flex cursor-pointer items-center rounded-sm bg-slate-200 p-2 text-sm transition-colors hover:bg-slate-300 group-[.ProseMirror-selectednode]:bg-slate-300'>
          <Icon className='mr-2 size-5' />
          <div className='flex flex-1 items-center'>
            {isEditing ? (
              <input
                ref={inputRef}
                type='text'
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename()
                    e.stopPropagation()
                  }
                  if (e.key === 'Escape') {
                    setFileName(name)
                    setIsEditing(false)
                    e.stopPropagation()
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className='mr-2 flex-1 rounded-sm border border-slate-400 bg-white px-1 py-0.5 text-sm outline-hidden focus:border-blue-500'
              />
            ) : (
              <>
                <span className='mr-2'>{name}</span>
                <span className='text-slate-600 italic'>{sizelabel}</span>
              </>
            )}
          </div>
          {!isEditing && (
            <div className='flex items-center' onClick={(e) => e.stopPropagation()}>
              <Menu
                trigger={
                  <div className='flex items-center'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className='flex cursor-pointer items-center justify-center rounded-sm p-1 text-slate-600 hover:bg-slate-400 hover:text-slate-700 focus:bg-slate-400 focus:outline-hidden active:bg-slate-400'>
                          <MoreVertIcon className='size-5 opacity-0 transition-opacity group-hover:opacity-100' />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side='bottom'>More options</TooltipContent>
                    </Tooltip>
                  </div>
                }
              >
                <MenuContent align='end' side='bottom' sideOffset={4}>
                  <MenuItem
                    onSelect={() => {
                      setIsEditing(true)
                      setFileName(name)
                    }}
                  >
                    <EditIcon className='mr-2 size-4 text-slate-600' />
                    Rename
                  </MenuItem>
                </MenuContent>
              </Menu>
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}
