import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {fetch} from '@whatwg-node/fetch'
import imageNotSupportedPlaceholder from '../../static/images/illustrations/imageNotSupportedPlaceholder.png'
import type AuthToken from './database/types/AuthToken'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import type {AssetType, PartialPath} from './fileStorage/FileStoreManager'
import getFileStoreManager from './fileStorage/getFileStoreManager'
import type {AssetScopeEnum} from './graphql/public/resolverTypes'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import getKysely from './postgres/getKysely'
import {getUserId, isTeamMember} from './utils/authorization'
import {CipherId} from './utils/CipherId'
import getReqAuth from './utils/getReqAuth'
import {Logger} from './utils/Logger'
import {redisStoreOrNetwork} from './utils/redisStoreOrNetwork'

let placeholderBuffer: Buffer | undefined
const servePlaceholderImage = async (res: HttpResponse) => {
  if (!placeholderBuffer) {
    try {
      const res = await fetch(imageNotSupportedPlaceholder)
      placeholderBuffer = Buffer.from(await res.arrayBuffer())
    } catch (e) {
      Logger.error('Placeholder image could not be fetched', e)
    }
  }
  res
    .writeStatus('200')
    .writeHeader('Content-Type', 'image/png')
    .writeHeader('Vary', 'Authorization, X-Application-Authorization')
    .writeHeader('Cache-Control', 'no-store, max-age=0')
    .end(placeholderBuffer)
}

const checkAccess = async (
  authToken: AuthToken,
  scope: AssetScopeEnum,
  scopeCode: string,
  assetType: AssetType
) => {
  const viewerId = getUserId(authToken)
  if (scope === 'User') {
    if (assetType === 'picture') {
      // User/picture is for avatars. All user avatars are visible to all users
      return true
    } else {
      if ([viewerId, 'aGhostUser'].includes(scopeCode)) return true
    }
  } else if (scope === 'Team') {
    if (assetType === 'picture') {
      // all team avatars (not yet implemented) are visible to all users
      return true
    } else {
      if (isTeamMember(authToken, scopeCode)) return true
    }
  } else if (scope === 'Organization') {
    if (assetType === 'picture') {
      // all org avatars are visible to all users
      return true
    } else {
      // aGhostOrg contains all parabol-seeded assets, e.g. illustrations
      if (scopeCode === 'aGhostOrg') return true
      const inOrg = await getKysely()
        .selectFrom('OrganizationUser')
        .select('id')
        .where('userId', '=', viewerId)
        .where('orgId', '=', scopeCode)
        .where('removedAt', 'is', null)
        .limit(1)
        .executeTakeFirst()
      if (inOrg) return true
    }
  } else if (scope === 'Page') {
    const dataLoader = getNewDataLoader('imageProxyPage')
    const pageId = CipherId.decrypt(Number(scopeCode))
    const pageAccess = await dataLoader.get('pageAccessByUserId').load({pageId, userId: viewerId})
    dataLoader.dispose()
    if (pageAccess) return true
  }
  return false
}

export const assetProxyHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const partialPath = req.getUrl().slice('/assets'.length + 1)
  if (!partialPath) {
    res.writeStatus('404').end()
    return
  }
  const authToken = getReqAuth(req)
  const [scope, scopeCode, assetType, _filename] = partialPath.split('/') as [
    AssetScopeEnum,
    string,
    AssetType,
    string
  ]
  const canAccess = await checkAccess(authToken, scope, scopeCode, assetType)
  if (!canAccess) {
    await servePlaceholderImage(res)
    return
  }

  const manager = getFileStoreManager()
  const url = await redisStoreOrNetwork(
    `presignedURL:${partialPath}`,
    () => manager.presignUrl(partialPath as PartialPath),
    60_000
  )
  res
    .writeStatus('307')
    .writeHeader('Location', url)
    .writeHeader('Vary', 'Authorization, X-Application-Authorization')
    .writeHeader('Cache-Control', 'no-store, max-age=0')
    .end()
})
