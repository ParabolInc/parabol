import base64url from 'base64url'
import {createHash} from 'crypto'
import {GraphQLError} from 'graphql'
import filetypeinfo from 'magic-bytes.js'
import mime from 'mime-types'
import type AuthToken from '../../../database/types/AuthToken'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {getUserId, isTeamMember, isUserInOrg} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {compressImage} from '../../../utils/compressImage'
import type {DataLoaderWorker} from '../../graphql'
import type {AssetScopeEnum, MutationResolvers} from '../resolverTypes'

export const validateScope = async (
  authToken: AuthToken,
  scope: AssetScopeEnum,
  scopeKey: string,
  dataLoader: DataLoaderWorker
) => {
  const viewerId = getUserId(authToken)
  let scopeCode = scopeKey
  if (scope === 'User' && scopeKey !== viewerId) {
    return {error: {message: 'scopeKey must match your viewerId'}}
  } else if (scope === 'Team' && !isTeamMember(authToken, scopeKey)) {
    return {error: {message: 'scopeKey must match one of your teams'}}
  } else if (scope === 'Organization') {
    const inOrg = await isUserInOrg(viewerId, scopeKey, dataLoader)
    if (!inOrg) {
      return {error: {message: 'scopeKey must match one of your organizations'}}
    }
  } else if (scope === 'Page') {
    const [pageId, pageCode] = CipherId.fromClient(scopeKey)
    scopeCode = `${pageCode}`
    const pageAccess = await dataLoader.get('pageAccessByUserId').load({pageId, userId: viewerId})
    if (!pageAccess || pageAccess === 'viewer') {
      return {error: {message: 'You must be a page commentor or higher to use the page scope'}}
    }
  }
  return scopeCode
}

const uploadUserAsset: MutationResolvers['uploadUserAsset'] = async (
  _,
  {file, scope, scopeKey},
  {authToken, dataLoader}
) => {
  // VALIDATION
  const viewerId = getUserId(authToken)
  const highestTier = await dataLoader.get('highestTierForUserId').load(viewerId)
  const scopeCode = await validateScope(authToken, scope, scopeKey, dataLoader)
  if (typeof scopeCode !== 'string') return scopeCode

  const contentType = file.type
  const buffer = Buffer.from<ArrayBufferLike>(await file.arrayBuffer())
  const ext = mime.extension(contentType)
  if (!ext) {
    return {
      error: {message: `Unable to determine extension for ${contentType}`}
    }
  }
  const info = filetypeinfo(new Uint8Array(buffer))
  const contentIsCorrectType = info.some((i) => i.mime === file.type)
  const assumedType = info[0]?.typename
  if (info.length > 0 && !contentIsCorrectType) {
    throw new GraphQLError(`Expected ${file.type} but received ${assumedType}`)
  }
  const isImage = file.type.includes('image')
  let fileBuffer = buffer
  let fileExtension = ext
  if (isImage) {
    const res = await compressImage(buffer, ext)
    fileBuffer = res.buffer
    fileExtension = res.extension
    if (fileBuffer.byteLength > 8_000_000) {
      return {error: {message: `Max asset size is 8MB`}}
    }
  } else {
    const maxSize = highestTier === 'starter' ? 8_000_000 : 64_000_000
    if (buffer.byteLength > maxSize) {
      return {error: {message: `Max asset size is ${maxSize} bytes`}}
    }
  }
  const hashName = base64url.fromBase64(createHash('sha256').update(fileBuffer).digest('base64'))
  // RESOLUTION
  const manager = getFileStoreManager()
  const url = await manager.putUserFile(
    fileBuffer,
    `${scope}/${scopeCode}/assets/${hashName}.${fileExtension}`
  )
  return {
    url,
    name: file.name || hashName,
    type: file.type || assumedType || '',
    size: fileBuffer.byteLength
  }
}

export default uploadUserAsset
