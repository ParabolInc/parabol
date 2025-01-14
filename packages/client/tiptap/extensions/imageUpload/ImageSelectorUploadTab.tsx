import {useRef} from 'react'
import {Button} from '../../../ui/Button/Button'
import jpgWithoutEXIF from '../../../utils/jpgWithoutEXIF'
import resizeImageWithCanvas from '../../../utils/resizeImageWithCanvas'

interface Props {}

export const ImageSelectorUploadTab = (_props: Props) => {
  const ref = useRef<HTMLInputElement>(null)
  const onSubmit = async (file: File) => {
    if (file.type === 'image/jpeg') {
      file = (await jpgWithoutEXIF(file)) as File
    }
    if (file.size > 2 ** 23) {
      file = await resizeImageWithCanvas(file, 1280, 720, 2 ** 23)
    }
    // TODO upload to server
    // submitMutation()
    // UploadUserImageMutation(atmosphere, {}, {onCompleted, onError}, {file})
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement> | React.FormEvent<HTMLFormElement>) => {
    const {files} = e.currentTarget
    const imageToUpload = files ? files[0] : null
    if (!imageToUpload) return
    onSubmit(imageToUpload)
  }

  return (
    <div className='flex min-w-44 items-center justify-center rounded-md bg-slate-100 p-2'>
      <Button variant='outline' shape='pill' className='w-full'>
        Upload file
      </Button>
      <input
        className='hidden'
        ref={ref}
        type='file'
        accept='.jpg,.jpeg,.png,.webp,.gif'
        onChange={onChange}
      />
    </div>
  )
}
