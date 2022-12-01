import {GraphQLID, GraphQLNonNull} from 'graphql'
import FileStoreManager from '../../fileStorage/FileStoreManager'
import getFileStoreManager from '../../fileStorage/getFileStoreManager'
import normalizeAvatarUpload from '../../fileStorage/normalizeAvatarUpload'
import validateAvatarUpload from '../../fileStorage/validateAvatarUpload'
import {getUserId, isUserBillingLeader} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import GraphQLFileType from '../types/GraphQLFileType'
import UpdateOrgPayload from '../types/UpdateOrgPayload'
import {GQLContext} from './../graphql'
import {default as updateOrgResolver} from './helpers/updateOrg'

export default {
  type: new GraphQLNonNull(UpdateOrgPayload),
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
    _: unknown,
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
    context: GQLContext
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
    const [validExt, validBuffer] = await validateAvatarUpload(contentType, buffer)

    // RESOLUTION
    const [normalExt, normalBuffer] = await normalizeAvatarUpload(validExt, validBuffer)
    const orgAvatarPath = FileStoreManager.getOrgAvatarPath(orgId, normalExt)
    const publicLocation = await getFileStoreManager().putFile({
      partialPath: orgAvatarPath,
      buffer: normalBuffer
    })

    const updatedOrg = await updateOrgResolver(
      undefined,
      {
        updatedOrg: {
          id: orgId,
          picture: publicLocation
        }
      },
      context
    )
    return updatedOrg
  }
}
