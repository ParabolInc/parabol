import base64url from 'base64url'
import {createHash} from 'crypto'
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
  const scopeCode = await validateScope(authToken, scope, scopeKey, dataLoader)
  if (typeof scopeCode !== 'string') return scopeCode

  const contentType = file.type
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = mime.extension(contentType)
  if (!ext) {
    return {
      error: {message: `Unable to determine extension for ${contentType}`}
    }
  }
  const {buffer: compressedBuffer, extension} = await compressImage(buffer, ext)
  if (compressedBuffer.byteLength > 2 ** 23) {
    return {error: {message: `Max asset size is ${2 ** 23} bytes`}}
  }
  const hashName = base64url.fromBase64(
    createHash('sha256').update(compressedBuffer).digest('base64')
  )
  // RESOLUTION
  const manager = getFileStoreManager()
  const url = await manager.putUserFile(
    compressedBuffer,
    `${scope}/${scopeCode}/assets/${hashName}.${extension}`
  )
  return {url}
}

export default uploadUserAsset
