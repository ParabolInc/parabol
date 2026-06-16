import styled from '@emotion/styled'
import sanitizeSVG from '@mattkrick/sanitize-svg'
import UploadOrgImageMutation from '~/mutations/UploadOrgImageMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import {Dialog} from '../ui/Dialog/Dialog'
import {DialogContent} from '../ui/Dialog/DialogContent'
import {DialogTitle} from '../ui/Dialog/DialogTitle'
import jpgWithoutEXIF from '../utils/jpgWithoutEXIF'
import svgToPng from '../utils/svgToPng'
import Avatar from './Avatar/Avatar'
import AvatarInput from './AvatarInput'

const AvatarBlock = styled('div')({
  margin: '1.5rem auto',
  width: '6rem'
})

interface Props {
  isOpen: boolean
  onClose: () => void
  picture: string
  orgId: string
}

const OrgAvatarInput = (props: Props) => {
  const {isOpen, onClose, picture, orgId} = props
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
    UploadOrgImageMutation(atmosphere, {orgId}, {onCompleted, onError}, {file})
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle>{'Upload a New Photo'}</DialogTitle>
        <AvatarBlock>
          <Avatar
            picture={picture}
            className='h-24 w-24 shadow-[0_4px_5px_0px_rgba(218,218,218,1)]'
          />
        </AvatarBlock>
        <AvatarInput error={error?.message} onSubmit={onSubmit} />
      </DialogContent>
    </Dialog>
  )
}

export default OrgAvatarInput
