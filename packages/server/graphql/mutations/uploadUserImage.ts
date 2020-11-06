import {GraphQLBoolean, GraphQLInt} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import GraphQLFileType from '../types/GraphQLFileType'
import validateAvatarUpload from '../../utils/validateAvatarUpload'
import shortid from 'shortid'
import getFileStoreManager from '../../fileStorage/getFileStoreManager'

export default {
  type: GraphQLBoolean, // todo: return payload
  description: 'Upload an image for a user avatar',
  args: {
    dummy: {
      type: GraphQLInt,
      description: 'test test'
    },
    file: {
      type: GraphQLFileType,
      description: 'the file'
    },
    test: {
      type: GraphQLInt,
      description: 'testtest '
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
    {authToken}
  ) => {
    // AUTH
    if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
    const userId = getUserId(authToken)

    // VALIDATION
    const {contentType, buffer: jsonBuffer} = file
    const buffer = Buffer.from(jsonBuffer.data)
    const [ext, validBuffer] = await validateAvatarUpload(contentType, buffer)

    // RESOLUTION
    const fileName = shortid.generate()
    const location = await getFileStoreManager().putFile({
      fileName,
      ext,
      buffer: validBuffer,
      userId
    })
    console.log('file location:', location)
    /*
    todos: 
      - create abstract fileStorage sendFile handler
      - PR trebuchet client package to really expect uploadables
      - normalize image size to min necessary for avatar
      - mutation for org avatar
      - update user picture field after put success
    */

    return true
  }
}
