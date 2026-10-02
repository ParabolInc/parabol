import {GraphQLError} from 'graphql'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import type {MutationResolvers} from '../resolverTypes'

const uploadIdPMetadata: MutationResolvers['uploadIdPMetadata'] = async (
  _,
  {file, samlId},
  {dataLoader}
) => {
  // VALIDATION
  const contentType = file.type
  const buffer = Buffer.from(await file.arrayBuffer())
  if (!contentType || !contentType.includes('xml')) {
    throw new GraphQLError('file must be XML')
  }
  if (buffer.byteLength > 1000000) {
    throw new GraphQLError('file must be less than 1MB')
  }
  if (buffer.byteLength <= 1) {
    throw new GraphQLError('file must be larger than 1 byte')
  }

  // RESOLUTION
  const {orgId} = await dataLoader.get('saml').loadNonNull(samlId)
  const manager = getFileStoreManager()
  const url = await manager.putUserFile(buffer, `Organization/${orgId}/idpMetadata/${samlId}.xml`)
  return {url}
}

export default uploadIdPMetadata
