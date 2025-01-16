import ImageIcon from '@mui/icons-material/Image'
import {NodeViewWrapper, type Editor} from '@tiptap/react'
import {useCallback} from 'react'

interface Props {
  getPos(): number
  editor: Editor
}

export const ImageUploadView = (props: Props) => {
  const {getPos, editor} = props
  const onClick = useCallback(() => {
    editor.commands.setNodeSelection(getPos())
  }, [getPos, editor.commands])

  return (
    <NodeViewWrapper>
      <div className='m-0 p-0' onClick={onClick} contentEditable={false}>
        <div className='flex items-center rounded bg-slate-200 p-2'>
          <ImageIcon className='size-6' />
          <span className='text-sm'>Add an image</span>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
