import {fetch} from '@whatwg-node/fetch'
import base64url from 'base64url'
import {createHash} from 'crypto'
import mime from 'mime-types'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {compressImage} from '../../../utils/compressImage'
import type {MutationResolvers} from '../resolverTypes'
import {validateScope} from './uploadUserAsset'

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

const embedUserAsset: MutationResolvers['embedUserAsset'] = async (
  _,
  {url, scope, scopeKey},
  {authToken, dataLoader}
) => {
  // VALIDATION
  const scopeCode = await validateScope(authToken, scope, scopeKey, dataLoader)
  if (typeof scopeCode !== 'string') return scopeCode

  const asset = await fetchImage(url)
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
  const {buffer: compressedBuffer, extension} = await compressImage(buffer, ext)
  if (compressedBuffer.byteLength > 2 ** 23) {
    return {error: {message: `Max asset size is ${2 ** 23} bytes`}}
  }
  const hashName = base64url.fromBase64(
    createHash('sha256').update(compressedBuffer).digest('base64')
  )
  // RESOLUTION
  const manager = getFileStoreManager()
  const hostedUrl = await manager.putUserFile(
    compressedBuffer,
    `${scope}/${scopeCode}/assets/${hashName}.${extension}`
  )
  return {url: hostedUrl}
}

export default embedUserAsset
