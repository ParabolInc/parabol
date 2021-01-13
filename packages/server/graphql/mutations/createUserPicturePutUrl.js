import {GraphQLNonNull} from 'graphql'
import CreateUserPicturePutUrlPayload from '../types/CreateUserPicturePutUrlPayload'
import {getUserId, isAuthenticated} from '../../utils/authorization'
import getS3SignedPutUrl from '../../utils/getS3SignedPutUrl'
import validateAvatarUpload from '../../fileStorage/validateAvatarUpload'
import shortid from 'shortid'
import standardError from '../../utils/standardError'
import ImageMetadataInput from '../types/ImageMetadataInput'

const createUserPicturePutUrl = {
  type: CreateUserPicturePutUrlPayload,
  deprecationReason: 'Replaced with `uploadUserImage` mutation',
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
    const url = await getS3SignedPutUrl(contentType, contentLength, partialPath)
    let pngUrl
    if (pngVersion) {
      const partialPath = `User/${userId}/picture/${imgId}.png`
      pngUrl = await getS3SignedPutUrl(contentType, contentLength, partialPath)
    }
    return {url, pngUrl}
  }
}

export default createUserPicturePutUrl
