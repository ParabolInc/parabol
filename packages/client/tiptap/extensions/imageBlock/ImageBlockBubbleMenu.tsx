import AspectRatioIcon from '@mui/icons-material/AspectRatio' // Fallback for full width
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import DownloadIcon from '@mui/icons-material/FileDownloadOutlined'
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight'
import SyncIcon from '@mui/icons-material/Sync'
import * as Popover from '@radix-ui/react-popover'
import {type Editor} from '@tiptap/react'
import {useRef} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {useUploadUserAsset} from '../../../mutations/useUploadUserAsset'
import {cn} from '../../../ui/cn'
import jpgWithoutEXIF from '../../../utils/jpgWithoutEXIF'

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

  const atmosphere = useAtmosphere()
  const [commit] = useUploadUserAsset()

  const handleUpload = async (file: File) => {
    if (file.type === 'image/jpeg') {
      file = (await jpgWithoutEXIF(file)) as File
    }
    if (file.size > 2 ** 23) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'fileTooBIG',
        message: 'The image is too large. Please select an image smaller than 8MB',
        autoDismiss: 5
      })
      return
    }

    const {pendingUploads} = editor.storage.imageUpload
    const previewUrl = URL.createObjectURL(file)
    const previewId = crypto.randomUUID()
    pendingUploads.set(previewId, previewUrl)
    updateAttributes({previewId})

    const {scopeKey, assetScope} = editor.storage.imageUpload

    commit({
      variables: {scope: assetScope, scopeKey},
      uploadables: {file: file},
      onCompleted: (res) => {
        const {uploadUserAsset} = res
        const message = uploadUserAsset?.error?.message
        if (message) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'errorUploadImage',
            message,
            autoDismiss: 5
          })
          return
        }
        const {url} = uploadUserAsset!
        updateAttributes({src: url!, previewId: undefined})
        pendingUploads.delete(previewId)
        URL.revokeObjectURL(previewUrl)
      }
    })
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
          className='fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 z-50 flex animate-in items-center rounded-sm border-[1px] border-slate-600 border-solid bg-white p-[3px] shadow-sm'
          sideOffset={8}
          side='top'
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Align Controls */}
          <div className='flex rounded-sm bg-slate-100'>
            {alignButtons.map(({name, Icon}) => (
              <button
                key={name}
                onClick={() => updateAttributes({align: name})}
                className={cn(
                  'rounded-sm p-1 hover:bg-slate-300',
                  align === name && 'bg-slate-300'
                )}
              >
                <Icon fontSize='small' className='text-slate-700' />
              </button>
            ))}
          </div>

          <Divider />

          {/* Full Width */}
          <button
            onClick={() => updateAttributes({isFullWidth: !isFullWidth})}
            className={cn('rounded-sm p-1 hover:bg-slate-300', isFullWidth && 'bg-slate-300')}
            title='Full width'
          >
            <AspectRatioIcon fontSize='small' className='text-slate-700' />
          </button>

          <Divider />

          {/* Dimensions */}
          <span className='px-2 font-mono text-slate-500 text-xs'>
            {isFullWidth ? '100%' : width ? `${Math.round(width)}px` : 'Auto'}
          </span>

          <Divider />

          {/* Download */}
          <a
            href={editor.getAttributes('imageBlock').src}
            download
            className='rounded-sm p-1 text-slate-700 hover:bg-slate-300'
            title='Download'
            target='_blank'
            rel='noopener noreferrer'
          >
            <DownloadIcon fontSize='small' />
          </a>

          {/* Replace */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className='rounded-sm p-1 text-slate-700 hover:bg-slate-300'
            title='Replace image'
          >
            <SyncIcon fontSize='small' />
          </button>
          <input
            type='file'
            ref={fileInputRef}
            className='hidden'
            accept='.jpg,.jpeg,.png,.webp,.gif'
            onChange={onFileChange}
          />

          {/* Delete */}
          <button
            onClick={() => editor.chain().deleteSelection().run()}
            className='rounded-sm p-1 text-slate-700 hover:bg-slate-300'
            title='Delete image'
          >
            <DeleteIcon fontSize='small' />
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
