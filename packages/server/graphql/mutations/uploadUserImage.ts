import {GraphQLNonNull} from 'graphql'
import getFileStoreManager from '../../fileStorage/getFileStoreManager'
import normalizeAvatarUpload from '../../fileStorage/normalizeAvatarUpload'
import validateAvatarUpload from '../../fileStorage/validateAvatarUpload'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import GraphQLFileType from '../types/GraphQLFileType'
import UpdateUserProfilePayload from '../types/UpdateUserProfilePayload'
import {GQLContext} from './../graphql'
import updateUserProfile from './helpers/updateUserProfile'

export default {
  type: UpdateUserProfilePayload,
  description: 'Upload an image for a user avatar',
  args: {
    file: {
      type: new GraphQLNonNull(GraphQLFileType),
      description: 'the user avatar image file'
    }
  },
  resolve: async (
    _: unknown,
    {
      file
    }: {
      file: {
        contentType: string
        buffer: {
          type: 'Buffer'
          data: Array<number>
        }
      }
    },
    context: GQLContext
  ) => {
    // AUTH
    const {authToken} = context
    if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
    const userId = getUserId(authToken)

    // VALIDATION
    const {contentType, buffer: jsonBuffer} = file
    const buffer = Buffer.from(jsonBuffer.data)
    const [validExt, validBuffer] = await validateAvatarUpload(contentType, buffer)

    // RESOLUTION
    const [normalExt, normalBuffer] = await normalizeAvatarUpload(validExt, validBuffer)
    const manager = getFileStoreManager()
    const publicLocation = await manager.putUserAvatar(normalBuffer, userId, normalExt)
    const updatedUser = await updateUserProfile(
      undefined,
      {updatedUser: {picture: publicLocation}},
      context
    )
    return updatedUser
  }
}
