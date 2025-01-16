import {useRef} from 'react'
import useAtmosphere from '../../../hooks/useAtmosphere'
import {useUploadUserAsset} from '../../../mutations/useUploadUserAsset'
import {Button} from '../../../ui/Button/Button'
import jpgWithoutEXIF from '../../../utils/jpgWithoutEXIF'

interface Props {
  setImageURL: (url: string) => void
}

export const ImageSelectorUploadTab = (props: Props) => {
  const {setImageURL} = props
  const ref = useRef<HTMLInputElement>(null)
  const atmosphere = useAtmosphere()
  const [commit] = useUploadUserAsset()
  const onSubmit = async (file: File) => {
    if (file.type === 'image/jpeg') {
      file = (await jpgWithoutEXIF(file)) as File
    }
    if (file.size > 2 ** 23) {
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'fileTooBIG',
        message: 'The image is too large. Please select an image smaller than 8MB',
        autoDismiss: 5
      })
    }
    commit({
      variables: {},
      uploadables: {file: file},
      onCompleted: (res) => {
        const {uploadUserAsset} = res
        const {url} = uploadUserAsset!
        const message = uploadUserAsset?.error?.message
        if (message) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'errorUploadIdPtMetadata',
            message,
            autoDismiss: 5
          })
          return
        }
        setImageURL(url!)
      }
    })
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
  return (
    <div className='flex min-w-44 items-center justify-center rounded-md bg-slate-100 p-2'>
      <Button variant='outline' shape='pill' className='w-full' onClick={onClick} autoFocus>
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
