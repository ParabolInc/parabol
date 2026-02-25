import {fetch} from '@whatwg-node/fetch'
import base64url from 'base64url'
import {createHash} from 'crypto'
import {GraphQLError} from 'graphql'
import mime from 'mime-types'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import {
  MAX_USER_UPLOAD_BYTES_FREE,
  MAX_USER_UPLOAD_BYTES_PAID
} from '../../../../client/utils/constants'
import appOrigin from '../../../appOrigin'
import type {AssetType, PartialPath} from '../../../fileStorage/FileStoreManager'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {getUserId} from '../../../utils/authorization'
import {compressImage} from '../../../utils/compressImage'
import {fetchUntrusted} from '../../../utils/fetchUntrusted'
import {Logger} from '../../../utils/Logger'
import type {AssetScopeEnum, MutationResolvers} from '../resolverTypes'
import {incrementUserBytesUploaded, validateScope} from './uploadUserAsset'

const embedUserAsset: MutationResolvers['embedUserAsset'] = async (
  _,
  {url, scope, scopeKey},
  {authToken, dataLoader}
) => {
  // VALIDATION
  const viewerId = getUserId(authToken)
  const [scopeCode, userDetails, viewerTier] = await Promise.all([
    validateScope(authToken, scope, scopeKey, dataLoader),
    dataLoader.get('userDetails').load(viewerId),
    dataLoader.get('highestTierForUserId').load(viewerId)
  ])
  const maxSize = viewerTier === 'starter' ? MAX_USER_UPLOAD_BYTES_FREE : MAX_USER_UPLOAD_BYTES_PAID
  if (BigInt(userDetails?.bytesUploaded || 0) > BigInt(maxSize)) {
    return {error: {message: `Upload limit reached. Please contact sales`}}
  }
  if (typeof scopeCode !== 'string') return scopeCode
  const hostedPrefix = makeAppURL(appOrigin, '/assets')
  const isParabolHostedAsset = url.startsWith(hostedPrefix)
  if (isParabolHostedAsset) {
    // if we host it, just make a copy of it in the new directory
    const manager = getFileStoreManager()
    const sourcePartialPath = url.slice(hostedPrefix.length + 1) as PartialPath
    const [scope, _sourceScopeCode, assetType, filename] = sourcePartialPath.split('/') as [
      AssetScopeEnum,
      string,
      AssetType,
      string
    ]
    const targetPartialPath = `${scope}/${scopeCode}/${assetType}/${filename}` as PartialPath
    try {
      const [newUrl, localRes] = await Promise.all([
        manager.copyFile(sourcePartialPath, targetPartialPath),
        fetch(url, {method: 'HEAD'})
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
      throw new GraphQLError('Could not copy parabol asset')
    }
  }
  const asset = await fetchUntrusted(url, maxSize)
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
  // RESOLUTION
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

export default embedUserAsset
