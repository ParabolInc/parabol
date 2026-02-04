import AspectRatioIcon from '@mui/icons-material/AspectRatio' // Fallback for full width
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined'
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import * as Popover from '@radix-ui/react-popover'
import {type Editor} from '@tiptap/react'
import {useRef} from 'react'
import {Tooltip} from '../../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../../ui/Tooltip/TooltipTrigger'
import {BubbleMenuButton} from './BubbleMenuButton'

interface Props {
  editor: Editor
  updateAttributes: (attributes: Record<string, any>) => void
  align: 'left' | 'right' | 'center'
  width: number
  isFullWidth: boolean
  isOpen: boolean
}

const Divider = () => <div className='mx-1 h-4 w-px bg-slate-300' />
const alignButtons = [
  {name: 'left', Icon: FormatAlignLeftIcon},
  {name: 'center', Icon: FormatAlignCenterIcon},
  {name: 'right', Icon: FormatAlignRightIcon}
]

export const ImageBlockBubbleMenu = (props: Props) => {
  const {align, width, updateAttributes, isFullWidth, editor, isOpen} = props
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    editor.storage.fileUpload.onUpload(file, editor, 'image')
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    // reset
    e.target.value = ''
  }

  return (
    <Popover.Root open={isOpen}>
      <Popover.Anchor className='pointer-events-none absolute top-0 h-full w-full' />
      <Popover.Portal>
        <Popover.Content
          className='fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-10 flex animate-in items-center rounded-sm border border-slate-600 border-solid bg-white p-[3px] shadow-sm'
          sideOffset={8}
          side='top'
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Align Controls */}
          <div className='flex rounded-sm'>
            {alignButtons.map(({name, Icon}) => (
              <BubbleMenuButton
                key={name}
                onClick={() => updateAttributes({align: name})}
                isActive={align === name}
                Icon={Icon}
                title={`Align ${name}`}
              />
            ))}
          </div>

          <Divider />

          {/* Full Width */}
          <BubbleMenuButton
            onClick={() => updateAttributes({isFullWidth: !isFullWidth})}
            isActive={isFullWidth}
            Icon={AspectRatioIcon}
            title='Full width'
          />

          <Divider />

          {/* Dimensions */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='flex cursor-default items-center justify-center px-2 font-mono text-slate-500 text-xs'>
                {isFullWidth ? '100%' : width ? `${Math.round(width)}px` : 'Auto'}
              </span>
            </TooltipTrigger>
            <TooltipContent>Width</TooltipContent>
          </Tooltip>

          <Divider />

          {/* Download */}
          <BubbleMenuButton
            onClick={async () => {
              const src = editor.getAttributes('imageBlock').src
              if (!src) return
              const res = await fetch(src)
              const blob = await res.blob()
              const blobUrl = window.URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.href = blobUrl
              const url = new URL(src)
              link.download = url.pathname.split('/').pop()!
              link.click()
              window.URL.revokeObjectURL(blobUrl)
            }}
            Icon={DownloadIcon}
            title='Download'
          />

          {/* Replace */}
          <BubbleMenuButton
            onClick={() => fileInputRef.current?.click()}
            Icon={ImageSearchIcon}
            title='Replace image'
          />
          <input
            type='file'
            ref={fileInputRef}
            className='hidden'
            accept='image/*'
            onChange={onFileChange}
          />

          {/* Delete */}
          <BubbleMenuButton
            onClick={() => editor.chain().deleteSelection().run()}
            Icon={DeleteIcon}
            title='Delete image'
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
