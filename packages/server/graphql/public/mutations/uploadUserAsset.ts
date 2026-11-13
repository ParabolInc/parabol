import base64url from 'base64url'
import {createHash} from 'crypto'
import {GraphQLError} from 'graphql'
import mime from 'mime-types'
import {checkFileMimeType} from '../../../../client/shared/utils/checkFileMimeType'
import {
  MAX_FILE_SIZE_FREE,
  MAX_FILE_SIZE_PAID,
  MAX_IMAGE_SIZE,
  MAX_USER_UPLOAD_BYTES_FREE,
  MAX_USER_UPLOAD_BYTES_PAID
} from '../../../../client/utils/constants'
import type AuthToken from '../../../database/types/AuthToken'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import getKysely from '../../../postgres/getKysely'
import {getUserId, isTeamMember, isUserInOrg} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {compressImage} from '../../../utils/compressImage'
import getUserDetail from '../../../utils/getUserDetail'
import type {DataLoaderWorker} from '../../graphql'
import type {ResourceGrants} from '../ResourceGrants'
import type {AssetScopeEnum, MutationResolvers} from '../resolverTypes'

export const incrementUserBytesUploaded = async (userId: string, sizeInBytes: number) => {
  const pg = getKysely()
  await pg
    .insertInto('UserDetail')
    .values({id: userId, bytesUploaded: sizeInBytes})
    .onConflict((oc) =>
      oc.column('id').doUpdateSet((eb) => ({
        bytesUploaded: eb('UserDetail.bytesUploaded', '+', sizeInBytes)
      }))
    )
    .execute()
}
const getPageIdFromKey = (pageKey: string) => {
  try {
    return CipherId.fromClient(pageKey)
  } catch {
    throw new GraphQLError('Invalid pageId', {extensions: {code: 'BAD_USER_INPUT'}})
  }
}

export const validateScope = async (
  authToken: AuthToken,
  scope: AssetScopeEnum,
  scopeKey: string,
  dataLoader: DataLoaderWorker,
  resourceGrants?: ResourceGrants
) => {
  const viewerId = getUserId(authToken)
  let scopeCode = scopeKey
  if (scope === 'User' && scopeKey !== viewerId) {
    throw new GraphQLError('scopeKey must match your viewerId', {extensions: {code: 'FORBIDDEN'}})
  } else if (scope === 'Team') {
    if (!isTeamMember(authToken, scopeKey)) {
      throw new GraphQLError('scopeKey must match one of your teams', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    if (resourceGrants && !(await resourceGrants.hasTeam(scopeKey))) {
      throw new GraphQLError('PAT does not grant access to this team', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  } else if (scope === 'Organization') {
    const inOrg = await isUserInOrg(viewerId, scopeKey, dataLoader)
    if (!inOrg) {
      throw new GraphQLError('scopeKey must match one of your organizations', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    if (resourceGrants && !(await resourceGrants.hasOrg(scopeKey))) {
      throw new GraphQLError('PAT does not grant access to this organization', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  } else if (scope === 'Page') {
    const [pageId, pageCode] = getPageIdFromKey(scopeKey)
    scopeCode = `${pageCode}`
    const pageAccess = await dataLoader
      .get('pageAccessByPageIdUserId')
      .load({pageId, userId: viewerId})
    if (!pageAccess || pageAccess === 'viewer') {
      throw new GraphQLError('You must be a page commentor or higher to use the page scope', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    if (resourceGrants && !(await resourceGrants.hasPage(pageId))) {
      throw new GraphQLError('PAT does not grant access to this page', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
  }
  return scopeCode
}

const uploadUserAsset: MutationResolvers['uploadUserAsset'] = async (
  _,
  {file, scope, scopeKey},
  context
) => {
  const {authToken, dataLoader, resourceGrants} = context
  // VALIDATION
  const viewerId = getUserId(authToken)
  const [scopeCode, bytesUploaded, viewerTier] = await Promise.all([
    validateScope(authToken, scope, scopeKey, dataLoader, resourceGrants),
    getUserDetail(viewerId, 'bytesUploaded', dataLoader),
    dataLoader.get('highestTierForUserId').load(viewerId)
  ])
  const maxSize = viewerTier === 'starter' ? MAX_USER_UPLOAD_BYTES_FREE : MAX_USER_UPLOAD_BYTES_PAID
  if (BigInt(bytesUploaded) > BigInt(maxSize)) {
    throw new GraphQLError('Upload limit reached. Please contact sales', {
      extensions: {code: 'TOO_MANY_REQUESTS'}
    })
  }

  const contentType = file.type
  const buffer = Buffer.from<ArrayBufferLike>(await file.arrayBuffer())
  const ext = mime.extension(contentType)
  if (!ext) {
    throw new GraphQLError(`Unable to determine extension for ${contentType}`, {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  const mimeError = checkFileMimeType(new Uint8Array(buffer), contentType)
  if (mimeError) throw new GraphQLError(mimeError, {extensions: {code: 'BAD_USER_INPUT'}})
  const isImage = file.type.includes('image')
  let fileBuffer = buffer
  let fileExtension = ext
  if (isImage) {
    const res = await compressImage(buffer, ext)
    fileBuffer = res.buffer
    fileExtension = res.extension
    if (fileBuffer.byteLength > MAX_IMAGE_SIZE) {
      throw new GraphQLError(`Max image size is ${MAX_IMAGE_SIZE} bytes`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
  } else {
    const maxSize = viewerTier === 'starter' ? MAX_FILE_SIZE_FREE : MAX_FILE_SIZE_PAID
    if (buffer.byteLength > maxSize) {
      throw new GraphQLError(`Max file size is ${maxSize} bytes`, {
        extensions: {code: 'BAD_USER_INPUT'}
      })
    }
  }
  const hashName = base64url.fromBase64(createHash('sha256').update(fileBuffer).digest('base64'))
  // RESOLUTION
  const manager = getFileStoreManager()
  const [url] = await Promise.all([
    manager.putUserFile(fileBuffer, `${scope}/${scopeCode}/assets/${hashName}.${fileExtension}`),
    incrementUserBytesUploaded(viewerId, fileBuffer.byteLength)
  ])
  return {
    url,
    name: file.name || hashName,
    type: file.type || '',
    size: fileBuffer.byteLength
  }
}

export default uploadUserAsset
