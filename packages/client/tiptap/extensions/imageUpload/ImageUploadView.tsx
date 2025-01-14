import ImageIcon from '@mui/icons-material/Image'
import {NodeViewWrapper} from '@tiptap/react'

export const ImageUploadView = () => {
  return (
    <NodeViewWrapper>
      <div className='m-0 p-0' data-drag-handle>
        <div className='flex items-center rounded bg-slate-200 p-2'>
          <ImageIcon className='size-6' />
          <span className='text-sm'>Add an image</span>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
