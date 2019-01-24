import sanitizeSVG from '@mattkrick/sanitize-svg'
import React, {Component} from 'react'
import styled from 'react-emotion'
import Avatar from 'universal/components/Avatar/Avatar'
import AvatarInput from 'universal/components/AvatarInput'
import Type from 'universal/components/Type/Type'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import CreateUserPicturePutUrlMutation from 'universal/mutations/CreateUserPicturePutUrlMutation'
import UpdateUserProfileMutation from 'universal/mutations/UpdateUserProfileMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import sendAssetToS3 from 'universal/utils/sendAssetToS3'

interface Props extends WithAtmosphereProps, WithMutationProps {
  picture: string
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
  background: '#fff',
  borderRadius: 8,
  height: 374,
  width: 700
})

class UserAvatarInput extends Component<Props> {
  onSubmit = async (file: File) => {
    const {atmosphere, setDirty, submitting, onError, onCompleted, submitMutation} = this.props
    setDirty()
    if (file.size > 2 ** 21) {
      onError('File is too large')
      return
    }
    const isSanitary = await sanitizeSVG(file)
    if (!isSanitary) {
      onError('xss')
      return
    }
    if (submitting) return
    submitMutation()
    const variables = {
      contentType: file.type,
      contentLength: file.size
    }
    const handleCompleted = async (res) => {
      const {
        createUserPicturePutUrl: {url}
      } = res
      const pictureUrl = await sendAssetToS3(file, url)
      UpdateUserProfileMutation(atmosphere, {picture: pictureUrl}, {onError, onCompleted})
    }
    CreateUserPicturePutUrlMutation(atmosphere, variables, onError, handleCompleted)
  }

  render () {
    const {picture, dirty, error} = this.props
    return (
      <ModalBoundary>
        <Type align='center' bold scale='s6' colorPalette='mid'>
          {'Upload a New Photo'}
        </Type>
        <AvatarBlock>
          <Avatar picture={picture} size='fill' />
        </AvatarBlock>
        <AvatarInput error={dirty ? (error as string) : undefined} onSubmit={this.onSubmit} />
      </ModalBoundary>
    )
  }
}

export default withAtmosphere(withMutationProps(UserAvatarInput))
