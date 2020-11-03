import {GraphQLBoolean, GraphQLInt} from 'graphql'
import {getUserId} from '../../utils/authorization'
import {isAuthenticated} from '../../utils/authorization'
import standardError from '../../utils/standardError'
import GraphQLFileType from '../types/GraphQLFileType'
import {ResolvedFile} from '../types/GraphQLFileType'
import validateAvatarUpload from '../../utils/validateAvatarUpload'
import shortid from 'shortid'
import getS3PutUrl from '../../utils/getS3PutUrl'
import {s3PutObject} from '../../utils/s3'

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
  resolve: async (_, {file}: {file: ResolvedFile}, {authToken}) => {
    // AUTH
    if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
    const userId = getUserId(authToken)

    // VALIDATION
    const {contentType, fileBuffer} = file
    const ext = validateAvatarUpload(contentType)

    // RESOLUTION
    const fileName = shortid.generate()
    const partialPath = `User/${userId}/picture/${fileName}.${ext}`
    const fullPath = getS3PutUrl(partialPath)
    const buffer = Buffer.from(fileBuffer.data)
    await s3PutObject(fullPath, buffer)

    return true
  }
}
