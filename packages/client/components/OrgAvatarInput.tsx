import sanitizeSVG from '@mattkrick/sanitize-svg'
import React, {Component} from 'react'
import styled from '@emotion/styled'
import Avatar from './Avatar/Avatar'
import AvatarInput from './AvatarInput'
import DialogTitle from './DialogTitle'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import UploadOrgImageMutation from '~/mutations/UploadOrgImageMutation'

interface Props extends WithAtmosphereProps, WithMutationProps {
  picture: string
  orgId: string
}

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

class OrgAvatarInput extends Component<Props> {
  onSubmit = async (file: File) => {
    const {
      atmosphere,
      setDirty,
      submitting,
      orgId,
      onError,
      onCompleted,
      submitMutation
    } = this.props
    setDirty()
    if (file.size > 2 ** 21) {
      onError('File is too large (1MB Max)')
      return
    }
    const isSanitary = await sanitizeSVG(file)
    if (!isSanitary) {
      onError('xss')
      return
    }
    if (submitting) return
    submitMutation()
    UploadOrgImageMutation(
      atmosphere,
      {orgId},
      {onCompleted, onError},
      {file}
    )
  }

  render() {
    const {picture, dirty, error} = this.props
    return (
      <ModalBoundary>
        <StyledDialogTitle>{'Upload a New Photo'}</StyledDialogTitle>
        <AvatarBlock>
          <Avatar picture={picture} size={96} />
        </AvatarBlock>
        <AvatarInput error={dirty ? (error as string) : undefined} onSubmit={this.onSubmit} />
      </ModalBoundary>
    )
  }
}

export default withAtmosphere(withMutationProps(OrgAvatarInput))
