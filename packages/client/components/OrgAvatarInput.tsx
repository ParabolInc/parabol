import styled from '@emotion/styled'
import sanitizeSVG from '@mattkrick/sanitize-svg'
import React from 'react'
import UploadOrgImageMutation from '~/mutations/UploadOrgImageMutation'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import jpgWithoutEXIF from '../utils/jpgWithoutEXIF'
import svgToPng from '../utils/svgToPng'
import Avatar from './Avatar/Avatar'
import AvatarInput from './AvatarInput'
import DialogTitle from './DialogTitle'

const AvatarBlock = styled('div')({
  margin: '1.5rem auto',
  width: '6rem'
})

const flexBase = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center'
}

const ModalBoundary = styled('div')({
  ...flexBase,
  flexDirection: 'column',
  background: '#FFFFFF',
  borderRadius: 8,
  height: 374,
  width: 700
})

const StyledDialogTitle = styled(DialogTitle)({
  textAlign: 'center'
})

const AvatarWithShadow = styled(Avatar)({
  boxShadow: `0px 4px 5px 0px #DADADA`
})

interface Props {
  picture: string
  orgId: string
}

const OrgAvatarInput = (props: Props) => {
  const {picture, orgId} = props
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
        file = new File([png], file.name.slice(0, -3) + 'png', {type: png.type})
      }
    }
    submitMutation()
    UploadOrgImageMutation(atmosphere, {orgId}, {onCompleted, onError}, {file})
  }

  return (
    <ModalBoundary>
      <StyledDialogTitle>{'Upload a New Photo'}</StyledDialogTitle>
      <AvatarBlock>
        <AvatarWithShadow picture={picture} size={96} />
      </AvatarBlock>
      <AvatarInput error={error?.message} onSubmit={onSubmit} />
    </ModalBoundary>
  )
}

export default OrgAvatarInput
