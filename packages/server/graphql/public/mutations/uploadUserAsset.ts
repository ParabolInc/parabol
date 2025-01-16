import mime from 'mime-types'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {getUserId} from '../../../utils/authorization'
import {compressImage} from '../../../utils/compressImage'
import {MutationResolvers} from '../resolverTypes'

const uploadUserAsset: MutationResolvers['uploadUserAsset'] = async (_, {file}, {authToken}) => {
  // AUTH
  const userId = getUserId(authToken)

  // VALIDATION
  const {contentType, buffer: jsonBuffer} = file
  const buffer = Buffer.from(jsonBuffer.data)
  const ext = mime.extension(contentType)
  if (!ext) {
    return {error: {message: `Unable to determine extension for ${contentType}`}}
  }
  const {buffer: compressedBuffer, extension} = await compressImage(buffer, ext)
  if (compressedBuffer.byteLength > 2 ** 23) {
    return {error: {message: `Max asset size is ${2 ** 23} bytes`}}
  }
  // RESOLUTION
  const manager = getFileStoreManager()
  const url = await manager.putUserAsset(compressedBuffer, userId, extension)
  return {url}
}

export default uploadUserAsset
