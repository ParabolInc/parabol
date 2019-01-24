import React, {Component} from 'react'
import AvatarInput from 'universal/components/FileInput/AvatarInput'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import UpdateUserProfileMutation from 'universal/mutations/UpdateUserProfileMutation'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

// const validate = (values) => {
//   const schema = makeAvatarSchema()
//   return schema(values).errors
// }
//
// const uploadPicture = async (atmosphere, pictureFile) => {
//   const variables = {
//     contentType: pictureFile.type,
//     contentLength: pictureFile.size
//   }
//
//   return new Promise((resolve, reject) => {
//     const onError = (err) => {
//       reject(JSON.stringify(err))
//     }
//     const onCompleted = async (res) => {
//       const {
//         createUserPicturePutUrl: {url}
//       } = res
//       const pathname = await sendAssetToS3(pictureFile, url)
//       resolve(pathname)
//     }
//     CreateUserPicturePutUrlMutation(atmosphere, variables, onError, onCompleted)
//   })
// }

interface Props extends WithAtmosphereProps, WithMutationProps {}

class UserAvatarInput extends Component<Props> {
  onSubmit = async (file: File) => {
    const {atmosphere, setDirty, submitting, onError, onCompleted, submitMutation} = this.props
    setDirty()
    if (file.size > 2 ** 21) {
      onError('File is too large')
      return
    }
    if (submitting) return
    submitMutation()
    // window.file = file
    const name = 'avatar'
    const updatedUser = {picture: {name, type: file.type}}
    const uploadables = {[name]: file}
    UpdateUserProfileMutation(atmosphere, updatedUser, {uploadables, onError, onCompleted})
  }

  render () {
    const {dirty, error} = this.props
    return <AvatarInput error={dirty ? (error as string) : undefined} onSubmit={this.onSubmit} />
  }
}

export default withAtmosphere(withMutationProps(UserAvatarInput))
