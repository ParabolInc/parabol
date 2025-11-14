import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {fetch} from '@whatwg-node/fetch'
import imageNotSupportedPlaceholder from '../../static/images/illustrations/imageNotSupportedPlaceholder.png'
import type AuthToken from './database/types/AuthToken'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import getFileStoreManager from './fileStorage/getFileStoreManager'
import type {AssetScopeEnum} from './graphql/public/resolverTypes'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import getKysely from './postgres/getKysely'
import {getUserId, isTeamMember} from './utils/authorization'
import {CipherId} from './utils/CipherId'
import getReqAuth from './utils/getReqAuth'
import {Logger} from './utils/Logger'

let placeholderBuffer: Buffer | undefined
const servePlaceholderImage = async (res: HttpResponse) => {
  console.log({imageNotSupportedPlaceholder})
  if (!placeholderBuffer) {
    try {
      const res = await fetch(imageNotSupportedPlaceholder)
      placeholderBuffer = Buffer.from(await res.arrayBuffer())
    } catch (e) {
      Logger.error('Placeholder image could not be fetched', e)
    }
  }
  console.log('serving buff', imageNotSupportedPlaceholder, placeholderBuffer?.buffer.byteLength)
  res
    .writeStatus('200')
    .writeHeader('Content-Type', 'image/png')
    .writeHeader('Vary', 'Authorization, X-Application-Authorization')
    .writeHeader('Cache-Control', 'no-store, max-age=0')
    .end(placeholderBuffer)
}

const checkAccess = async (authToken: AuthToken, scope: AssetScopeEnum, scopeCode: string) => {
  const viewerId = getUserId(authToken)
  const scopes = ['User', 'Team', 'Organization', 'Page'] as const

  if (!scope || !scopes.includes(scope)) {
    return false
  } else if (scope === 'User' && scopeCode !== viewerId && scopeCode !== 'aGhostUser') {
    return false
  } else if (scope === 'Team' && !isTeamMember(authToken, scopeCode)) {
    return false
  } else if (scope === 'Organization' && scopeCode !== 'aGhostOrg') {
    const inOrg = await getKysely()
      .selectFrom('OrganizationUser')
      .select('id')
      .where('userId', '=', viewerId)
      .where('orgId', '=', scopeCode)
      .where('removedAt', 'is', null)
      .limit(1)
      .executeTakeFirst()
    if (!inOrg) {
      return false
    }
  } else if (scope === 'Page') {
    const dataLoader = getNewDataLoader('imageProxyPage')
    const pageId = CipherId.decrypt(Number(scopeCode))
    const pageAccess = await dataLoader.get('pageAccessByUserId').load({pageId, userId: viewerId})
    dataLoader.dispose()
    if (!pageAccess) return false
  }
  return true
}

export const imageProxyHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const partialPath = req.getUrl().slice('/images'.length + 1)
  if (!partialPath) {
    res.writeStatus('404').end()
    return
  }
  const authToken = getReqAuth(req)
  const [scope, scopeCode, _type, _filename] = partialPath.split('/') as [
    AssetScopeEnum,
    string,
    string,
    string
  ]
  const canAccess = await checkAccess(authToken, scope, scopeCode)
  if (!canAccess) {
    await servePlaceholderImage(res)
    return
  }

  const manager = getFileStoreManager()
  const fullPath = manager.prependPath(partialPath)
  const publicURL = manager.getPublicFileLocation(fullPath)
  // TODO: cache presigned values in redis for a bit to reduce a roundtrip
  const privateURL = await manager.presignUrl(publicURL)
  res
    .writeStatus('307')
    .writeHeader('Location', privateURL)
    .writeHeader('Vary', 'Authorization, X-Application-Authorization')
    .writeHeader('Cache-Control', 'no-store, max-age=0')
    .end()
})
