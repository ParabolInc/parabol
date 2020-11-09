import {GraphQLBoolean, GraphQLID, GraphQLNonNull} from 'graphql'
import GraphQLFileType from '../types/GraphQLFileType'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import validateAvatarUpload from '../../utils/validateAvatarUpload'
import FileStoreManager from '../../fileStorage/FileStoreManager'
import getFileStoreManager from '../../fileStorage/getFileStoreManager'

export default {
  type: GraphQLBoolean,
  description: 'Upload an image for an org avatar',
  args: {
    file: {
      type: new GraphQLNonNull(GraphQLFileType),
      description: 'the org avatar image file'
    },
    orgId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The org id to upload an avatar for'
    }
  },
  resolve: async (
    _,
    {
      file,
      orgId
    }: {
      file: {
        contentType: string
        buffer: {
          type: 'Buffer'
          data: Array<number>
        }
      }
      orgId: string
    },
    context
  ) => {
    // AUTH
    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)
    if (!(await isUserBillingLeader(viewerId, orgId, dataLoader))) {
      return standardError(new Error('Must be the organization leader'), {userId: viewerId})
    }

    // VALIDATION
    const {contentType, buffer: jsonBuffer} = file
    const buffer = Buffer.from(jsonBuffer.data)
    const [ext, validBuffer] = await validateAvatarUpload(contentType, buffer)

    // RESOLUTION
    const orgAvatarPath = FileStoreManager.getOrgAvatarPath(orgId, ext)
    const publicLocation = await getFileStoreManager().putFile({
      partialPath: orgAvatarPath,
      buffer: validBuffer
    })
    console.log('org avatar location:', publicLocation)

    return true
  }
}
