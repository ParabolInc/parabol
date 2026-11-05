import {fetch} from '@whatwg-node/fetch'
import base64url from 'base64url'
import {createHash} from 'crypto'
import mime from 'mime-types'
import {
  MAX_FILE_SIZE_FREE,
  MAX_FILE_SIZE_PAID,
  MAX_USER_UPLOAD_BYTES_FREE,
  MAX_USER_UPLOAD_BYTES_PAID
} from '../../../../../client/utils/constants'
import appOrigin from '../../../../appOrigin'
import {checkAccess} from '../../../../assetProxyHandler'
import type AuthToken from '../../../../database/types/AuthToken'
import type {AssetType, PartialPath} from '../../../../fileStorage/FileStoreManager'
import getFileStoreManager from '../../../../fileStorage/getFileStoreManager'
import {getUserId} from '../../../../utils/authorization'
import {compressImage} from '../../../../utils/compressImage'
import encodeAuthToken from '../../../../utils/encodeAuthToken'
import {fetchUntrusted} from '../../../../utils/fetchUntrusted'
import getUserDetail from '../../../../utils/getUserDetail'
import {Logger} from '../../../../utils/Logger'
import type {DataLoaderWorker} from '../../../graphql'
import type {AssetScopeEnum} from '../../resolverTypes'
import {incrementUserBytesUploaded} from '../uploadUserAsset'

const VALID_SCOPES: AssetScopeEnum[] = ['Page', 'User', 'Team', 'Organization']
const VALID_ASSET_TYPES: AssetType[] = ['assets', 'picture', 'metadata', 'template']

// Copies a URL into the file store on the viewer's quota, reading Parabol assets with the viewer's access
export const hostUserAsset = async (
  parsedUrl: URL,
  authToken: AuthToken,
  scope: AssetScopeEnum,
  scopeCode: string,
  dataLoader: DataLoaderWorker
) => {
  const url = parsedUrl.href
  const viewerId = getUserId(authToken)
  const [bytesUploaded, viewerTier] = await Promise.all([
    getUserDetail(viewerId, 'bytesUploaded', dataLoader),
    dataLoader.get('highestTierForUserId').load(viewerId)
  ])
  const maxSize = viewerTier === 'starter' ? MAX_USER_UPLOAD_BYTES_FREE : MAX_USER_UPLOAD_BYTES_PAID
  if (BigInt(bytesUploaded) > BigInt(maxSize)) {
    return {error: {message: `Upload limit reached. Please contact sales`}}
  }
  const isParabolHostedAsset =
    parsedUrl.origin === appOrigin && parsedUrl.pathname.startsWith('/assets/')
  if (isParabolHostedAsset) {
    // if we host it, just make a copy of it in the new directory
    const manager = getFileStoreManager()
    const sourcePartialPath = parsedUrl.pathname.slice('/assets/'.length) as PartialPath
    const [sourceScope, sourceScopeCode, assetType, filename] = sourcePartialPath.split('/') as [
      AssetScopeEnum,
      string,
      AssetType,
      string
    ]
    if (
      !VALID_SCOPES.includes(sourceScope) ||
      !VALID_ASSET_TYPES.includes(assetType) ||
      !filename ||
      filename.includes('..')
    ) {
      return {error: {message: 'Invalid asset URL'}}
    }
    const canAccessSource = await checkAccess(authToken, sourceScope, sourceScopeCode, assetType)
    if (!canAccessSource) {
      return {error: {message: 'Access denied to source asset'}}
    }
    const targetPartialPath = `${scope}/${scopeCode}/${assetType}/${filename}` as PartialPath
    try {
      const [newUrl, localRes] = await Promise.all([
        manager.copyFile(sourcePartialPath, targetPartialPath),
        fetch(url, {
          method: 'HEAD',
          headers: {Authorization: `Bearer ${encodeAuthToken(authToken)}`}
        })
      ])
      const {headers} = localRes
      const sizeInBytes = Number(headers.get('content-length')) || 0
      const contentType = headers.get('content-type') || mime.lookup(filename) || ''
      if (sizeInBytes > 0) {
        await incrementUserBytesUploaded(viewerId, sizeInBytes)
      }
      return {
        url: newUrl,
        name: filename,
        type: contentType,
        size: sizeInBytes
      }
    } catch (e) {
      Logger.warn(e)
      return {error: {message: 'Could not copy parabol asset'}}
    }
  }
  const maxFileSize = viewerTier === 'starter' ? MAX_FILE_SIZE_FREE : MAX_FILE_SIZE_PAID
  const asset = await fetchUntrusted(url, maxFileSize)
  if (!asset) {
    return {error: {message: 'Unable to fetch asset'}}
  }
  const {contentType, buffer} = asset
  const ext = mime.extension(contentType)
  if (!ext) {
    return {
      error: {message: `Unable to determine extension for ${contentType}`}
    }
  }
  let fileBuffer = buffer
  let fileExtension = ext
  if (contentType.includes('image')) {
    const compressionRes = await compressImage(buffer, ext)
    fileBuffer = compressionRes.buffer
    fileExtension = compressionRes.extension
    if (fileBuffer.byteLength > 2 ** 23) {
      return {error: {message: `Max asset size is ${2 ** 23} bytes`}}
    }
  }
  const hashName = base64url.fromBase64(createHash('sha256').update(fileBuffer).digest('base64'))
  const manager = getFileStoreManager()
  const [hostedUrl] = await Promise.all([
    manager.putUserFile(fileBuffer, `${scope}/${scopeCode}/assets/${hashName}.${fileExtension}`),
    incrementUserBytesUploaded(viewerId, fileBuffer.byteLength)
  ])

  return {
    url: hostedUrl,
    name: `${hashName}.${fileExtension}`,
    type: contentType,
    size: fileBuffer.byteLength
  }
}
