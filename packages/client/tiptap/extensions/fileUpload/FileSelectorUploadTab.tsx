import type {Editor} from '@tiptap/core'
import {useRef} from 'react'
import type {FileUploadTargetType} from '../../../shared/tiptap/extensions/FileUploadBase'
import {Button} from '../../../ui/Button/Button'

interface Props {
  editor: Editor
  targetType: FileUploadTargetType
}

export const FileSelectorUploadTab = (props: Props) => {
  const {editor, targetType} = props
  const ref = useRef<HTMLInputElement>(null)

  const onSubmit = async (file: File) => {
    editor.storage.fileUpload.onUpload(file, editor, targetType)
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLFormElement>) => {
    const {files} = e.currentTarget
    const imageToUpload = files ? files[0] : null
    if (!imageToUpload) return
    onSubmit(imageToUpload)
  }

  const onClick = () => {
    ref.current?.click()
  }
  const accept = targetType === 'image' ? '.jpg,.jpeg,.png,.webp,.gif' : '*'
  return (
    <div className='flex min-w-44 items-center justify-center rounded-md bg-slate-100 p-2'>
      <Button variant='outline' shape='pill' className='w-full' onClick={onClick} autoFocus>
        Upload {targetType}
      </Button>
      <input className='hidden' ref={ref} type='file' accept={accept} onChange={onChange} />
    </div>
  )
}
