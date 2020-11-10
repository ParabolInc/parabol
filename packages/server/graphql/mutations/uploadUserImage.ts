import {GraphQLNonNull} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import GraphQLFileType from '../types/GraphQLFileType'
import validateAvatarUpload from '../../utils/validateAvatarUpload'
import getFileStoreManager from '../../fileStorage/getFileStoreManager'
import FileStoreManager from '../../fileStorage/FileStoreManager'
import updateUserProfile from './helpers/updateUserProfile'
import UpdateUserProfilePayload from '../types/UpdateUserProfilePayload'

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
    _,
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
    context
  ) => {
    // AUTH
    const {authToken} = context
    if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
    const userId = getUserId(authToken)

    // VALIDATION
    const {contentType, buffer: jsonBuffer} = file
    const buffer = Buffer.from(jsonBuffer.data)
    const [ext, validBuffer] = await validateAvatarUpload(contentType, buffer)

    // RESOLUTION
    const userAvatarPath = FileStoreManager.getUserAvatarPath(userId, ext)
    const publicLocation = await getFileStoreManager().putFile({
      partialPath: userAvatarPath,
      buffer: validBuffer
    })
    console.log('user avatar location:', publicLocation)
    /*
    todos: 
      - create abstract fileStorage sendFile handler
        - fix whitelisting uploaded file in static server
      - PR trebuchet client package to really expect uploadables
      - normalize image size to min necessary for avatar
      - mutation for org avatar
        - update org after uploaded
      - update user picture field after put success
        - why isn't it updating automatically in UI?
    */
    const updatedUser = await updateUserProfile(
      undefined,
      {updatedUser: {picture: publicLocation}},
      context
    )
    return updatedUser
  }
}
