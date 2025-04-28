import {fetch} from '@whatwg-node/fetch'
import base64url from 'base64url'
import {createHash} from 'crypto'
import mime from 'mime-types'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {getUserId} from '../../../utils/authorization'
import {compressImage} from '../../../utils/compressImage'
import {MutationResolvers} from '../resolverTypes'

const fetchImage = async (url: string) => {
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

    return {contentType, buffer: Buffer.from(await res.arrayBuffer())}
  } catch (error) {
    console.error('Error fetching the resource:', error)
    return null
  }
}

const embedUserAsset: MutationResolvers['embedUserAsset'] = async (_, {url}, {authToken}) => {
  // AUTH
  const userId = getUserId(authToken)

  // VALIDATION
  const asset = await fetchImage(url)
  if (!asset) {
    return {error: {message: 'Unable to fetch asset'}}
  }
  const {contentType, buffer} = asset
  const ext = mime.extension(contentType)
  if (!ext) {
    return {error: {message: `Unable to determine extension for ${contentType}`}}
  }
  const hashName = base64url.fromBase64(createHash('sha256').update(buffer).digest('base64'))
  const {buffer: compressedBuffer, extension} = await compressImage(buffer, ext)
  if (compressedBuffer.byteLength > 2 ** 23) {
    return {error: {message: `Max asset size is ${2 ** 23} bytes`}}
  }
  // RESOLUTION
  const manager = getFileStoreManager()
  const hostedUrl = await manager.putUserAsset(compressedBuffer, userId, extension, hashName)
  return {url: hostedUrl}
}

export default embedUserAsset
