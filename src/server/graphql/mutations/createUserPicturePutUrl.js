import {GraphQLNonNull} from 'graphql'
import CreateUserPicturePutUrlPayload from 'server/graphql/types/CreateUserPicturePutUrlPayload'
import {getUserId, isAuthenticated} from 'server/utils/authorization'
import getS3PutUrl from 'server/utils/getS3PutUrl'
import validateAvatarUpload from 'server/utils/validateAvatarUpload'
import shortid from 'shortid'
import standardError from 'server/utils/standardError'
import ImageMetadataInput from 'server/graphql/types/ImageMetadataInput'

const createUserPicturePutUrl = {
  type: CreateUserPicturePutUrlPayload,
  description: 'Create a PUT URL on the CDN for the currently authenticated user’s profile picture',
  args: {
    image: {
      type: new GraphQLNonNull(ImageMetadataInput),
      description: 'user supplied image metadata'
    },
    pngVersion: {
      type: ImageMetadataInput,
      description: 'a png version of the above image'
    }
  },
  resolve: async (source, {image, pngVersion}, {authToken}) => {
    // AUTH
    if (!isAuthenticated(authToken)) return standardError(new Error('Not authenticated'))
    const userId = getUserId(authToken)

    // VALIDATION
    const {contentType, contentLength} = image
    const ext = validateAvatarUpload(contentType, contentLength)
    if (pngVersion) {
      validateAvatarUpload(pngVersion.contentType, pngVersion.contentLength)
    }

    // RESOLUTION
    const imgId = shortid.generate()
    const partialPath = `User/${userId}/picture/${imgId}.${ext}`
    const url = await getS3PutUrl(contentType, contentLength, partialPath)
    let pngUrl
    if (pngVersion) {
      const partialPath = `User/${userId}/picture/${imgId}.png`
      pngUrl = await getS3PutUrl(contentType, contentLength, partialPath)
    }
    return {url, pngUrl}
  }
}

export default createUserPicturePutUrl
