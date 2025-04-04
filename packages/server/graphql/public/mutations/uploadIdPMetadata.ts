import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {MutationResolvers} from '../resolverTypes'

const uploadIdPMetadata: MutationResolvers['uploadIdPMetadata'] = async (_, {file, orgId}) => {
  // VALIDATION
  const contentType = file.type
  const buffer = Buffer.from(await file.arrayBuffer())
  if (!contentType || !contentType.includes('xml')) {
    return {error: {message: 'file must be XML'}}
  }
  if (buffer.byteLength > 1000000) {
    return {error: {message: 'file must be less than 1MB'}}
  }
  if (buffer.byteLength <= 1) {
    return {error: {message: 'file must be larger than 1 byte'}}
  }

  // RESOLUTION
  const manager = getFileStoreManager()
  const url = await manager.putOrgIdPMetadata(buffer, orgId)
  return {url}
}

export default uploadIdPMetadata
