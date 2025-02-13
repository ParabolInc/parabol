import styled from '@emotion/styled'
import sanitizeSVG from '@mattkrick/sanitize-svg'
import {Close} from '@mui/icons-material'
import jpgWithoutEXIF from '~/utils/jpgWithoutEXIF'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import UploadUserImageMutation from '../mutations/UploadUserImageMutation'
import svgToPng from '../utils/svgToPng'
import Avatar from './Avatar/Avatar'
import AvatarInput from './AvatarInput'
import DialogTitle from './DialogTitle'
import FlatButton from './FlatButton'

const AvatarBlock = styled('div')({
  margin: '1.5rem auto',
  width: '6rem'
})

const ModalBoundary = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#FFFFFF',
  borderRadius: 8,
  height: 374,
  width: 700
})

type Props = {
  picture: string
  closeModal: () => void
}

const UserAvatarInput = (props: Props) => {
  const {closeModal, picture} = props
  const {error, onCompleted, onError, submitMutation, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()

  const handleClose = () => {
    closeModal()
  }

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
        file = new File([png], file.name.slice(0, -3) + 'png', {type: png.type})
      }
    }
    submitMutation()
    UploadUserImageMutation(atmosphere, {}, {onCompleted, onError}, {file})
  }

  return (
    <ModalBoundary>
      <div className='title-wrapper flex w-full items-center justify-between pr-6'>
        <DialogTitle className='text-slate-700'>{'Upload a New Photo'}</DialogTitle>
        <Close onClick={handleClose} className='text-xl text-slate-600 hover:cursor-pointer' />
      </div>
      <div>
        {/* upload */}
        <AvatarBlock>
          <Avatar picture={picture} className='h-24 w-24' />
        </AvatarBlock>
        <AvatarInput error={error?.message} onSubmit={onSubmit} />
      </div>
      <div className='flex w-full justify-end'>
        <FlatButton
          onClick={handleClose}
          className='mr-6 mb-6 bg-sky-500 font-semibold text-white duration-300 ease-in-out hover:bg-sky-700 focus:bg-sky-700'
        >
          {'Save'}
        </FlatButton>
      </div>
    </ModalBoundary>
  )
}

export default UserAvatarInput
