import base64url from 'base64url'
import {createHash} from 'crypto'
import mime from 'mime-types'
import makeAppURL from '../../../../client/utils/makeAppURL'
import appOrigin from '../../../appOrigin'
import getFileStoreManager from '../../../fileStorage/getFileStoreManager'
import {getUserId, isTeamMember, isUserInOrg} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {compressImage} from '../../../utils/compressImage'
import type {MutationResolvers} from '../resolverTypes'

const uploadUserAsset: MutationResolvers['uploadUserAsset'] = async (
  _,
  {file, scope, scopeKey},
  {authToken, dataLoader}
) => {
  // AUTH
  const viewerId = getUserId(authToken)

  // VALIDATION
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
  const contentType = file.type
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = mime.extension(contentType)
  if (!ext) {
    return {
      error: {message: `Unable to determine extension for ${contentType}`}
    }
  }
  const hashName = base64url.fromBase64(createHash('sha256').update(buffer).digest('base64'))
  const {buffer: compressedBuffer, extension} = await compressImage(buffer, ext)
  if (compressedBuffer.byteLength > 2 ** 23) {
    return {error: {message: `Max asset size is ${2 ** 23} bytes`}}
  }
  // RESOLUTION
  const manager = getFileStoreManager()
  const publicURL = await manager.putAsset(compressedBuffer, scope, scopeCode, hashName, extension)
  const partialPath = publicURL.split('/').slice(-4).join('/')
  const imageProxyURL = makeAppURL(appOrigin, `images/${partialPath}`)
  return {url: imageProxyURL}
}

export default uploadUserAsset
