import styled from '@emotion/styled'
import sanitizeSVG from '@mattkrick/sanitize-svg'
import jpgWithoutEXIF from '~/utils/jpgWithoutEXIF'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UploadUserImageMutation from '../mutations/UploadUserImageMutation'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import svgToPng from '../utils/svgToPng'
import Avatar from './Avatar/Avatar'
import AvatarInput from './AvatarInput'
import FlatButton from './FlatButton'

const AvatarBlock = styled('div')({
  margin: '1.5rem auto',
  width: '6rem'
})

type Props = {
  isOpen: boolean
  onClose: () => void
  picture: string
}

const UserAvatarInput = (props: Props) => {
  const {isOpen, onClose, picture} = props
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()

  const onSubmit = async (file: File) => {
    if (submitting) return
    if (file.type === 'image/jpeg') {
      file = (await jpgWithoutEXIF(file)) as File
    }
    if (file.size > 2 ** 20) {
      onError(new Error('File is too large (1MB Max)'))
      return
    }
    if (file.type === 'image/svg+xml') {
      const isSanitary = await sanitizeSVG(file)
      if (!isSanitary) {
        onError(new Error('xss'))
        return
      }
      const png = await svgToPng(file)
      if (png) {
        file = new File([png], file.name.slice(0, -3) + 'png', {
          type: png.type
        })
      }
    }
    submitMutation()
    UploadUserImageMutation(atmosphere, {}, {onCompleted, onError}, {file})
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle>{'Upload a New Photo'}</DialogTitle>
        <AvatarBlock>
          <Avatar picture={picture} className='h-24 w-24' />
        </AvatarBlock>
        <AvatarInput error={error?.message} onSubmit={onSubmit} />
        <div className='flex w-full justify-end'>
          <FlatButton
            onClick={onClose}
            className='mr-6 mb-6 bg-sky-500 font-semibold text-white duration-300 ease-in-out hover:bg-sky-700 focus:bg-sky-700'
          >
            {'Save'}
          </FlatButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserAvatarInput
