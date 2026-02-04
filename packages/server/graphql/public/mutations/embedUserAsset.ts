import {fetch} from '@whatwg-node/fetch'
import base64url from 'base64url'
import {createHash} from 'crypto'
import {GraphQLError} from 'graphql'
import mime from 'mime-types'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import type {AssetType, PartialPath} from '../../../fileStorage/FileStoreManager'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {compressImage} from '../../../utils/compressImage'
import {Logger} from '../../../utils/Logger'
import type {AssetScopeEnum, MutationResolvers} from '../resolverTypes'
import {validateScope} from './uploadUserAsset'

const fetchAsset = async (url: string) => {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.error('Failed to fetch the resource:', res.statusText)
      return null
    }

    const contentType = res.headers.get('Content-Type')
    if (!contentType) {
      console.error('Content-Type header is missing')
      return null
    }

    return {contentType, buffer: Buffer.from<ArrayBufferLike>(await res.arrayBuffer())}
  } catch (error) {
    console.error('Error fetching the resource:', error)
    return null
  }
}

const embedUserAsset: MutationResolvers['embedUserAsset'] = async (
  _,
  {url, scope, scopeKey},
  {authToken, dataLoader}
) => {
  // VALIDATION
  const scopeCode = await validateScope(authToken, scope, scopeKey, dataLoader)
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
      const url = await manager.copyFile(sourcePartialPath, targetPartialPath)
      const contentType = mime.lookup(filename)
      // TODO: fetch the real size
      return {url, name: filename, type: contentType || '', size: 0}
    } catch (e) {
      Logger.warn(e)
      throw new GraphQLError('Could not copy parabol asset')
    }
  }
  const asset = await fetchAsset(url)
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
  const hostedUrl = await manager.putUserFile(
    fileBuffer,
    `${scope}/${scopeCode}/assets/${hashName}.${fileExtension}`
  )

  return {
    url: hostedUrl,
    name: `${hashName}.${fileExtension}`,
    type: contentType,
    size: fileBuffer.byteLength
  }
}

export default embedUserAsset
