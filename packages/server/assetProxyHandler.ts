import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {fetch} from '@whatwg-node/fetch'
import {GraphQLError} from 'graphql'
import imageNotSupportedPlaceholder from '../../static/images/illustrations/imageNotSupportedPlaceholder.png'
import type AuthToken from './database/types/AuthToken'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import type {AssetType, PartialPath} from './fileStorage/FileStoreManager'
import getFileStoreManager from './fileStorage/getFileStoreManager'
import type {ResourceGrants} from './graphql/public/ResourceGrants'
import type {AssetScopeEnum} from './graphql/public/resolverTypes'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import {atlassianProxyHandler} from './integrations/jira/atlassianProxyHandler'
import getKysely from './postgres/getKysely'
import {getUserId, isTeamMember} from './utils/authorization'
import {CipherId} from './utils/CipherId'
import getAPIAuthToken from './utils/getAPIAuthToken'
import getAPIGrant from './utils/getAPIGrant'
import {canScopesReadAsset} from './utils/getAssetOwnerScope'
import getReqAuth from './utils/getReqAuth'
import {getBearerToken} from './utils/getRequestCredential'
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

export const checkAccess = async (
  authToken: AuthToken | null,
  scope: AssetScopeEnum,
  scopeCode: string,
  assetType: AssetType | 'idpMetadata' | 'idpMetadata.xml',
  resourceGrants?: ResourceGrants
) => {
  const viewerId = getUserId(authToken)
  if (scope === 'User') {
    if (assetType === 'picture') {
      // User/picture is for avatars. All user avatars are visible to all users
      return true
    } else {
      if (scopeCode === 'aGhostUser') return true
      if (resourceGrants && !resourceGrants.isUnrestricted()) return false
      if (scopeCode === viewerId) return true
    }
  } else if (scope === 'Team') {
    if (assetType === 'picture') {
      // all team avatars (not yet implemented) are visible to all users
      return true
    } else {
      if (isTeamMember(authToken, scopeCode)) return true
    }
  } else if (scope === 'Organization') {
    if (assetType === 'picture' || assetType === 'idpMetadata' || assetType === 'idpMetadata.xml') {
      // all org avatars and metadata are visible to all users
      return true
    } else {
      // aGhostOrg contains all parabol-seeded assets, e.g. illustrations
      if (scopeCode === 'aGhostOrg') return true
      if (resourceGrants && !(await resourceGrants.hasOrg(scopeCode))) return false
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
    const pageAccess = await dataLoader
      .get('pageAccessByPageIdUserId')
      .load({pageId, userId: viewerId})
    dataLoader.dispose()
    if (pageAccess && (!resourceGrants || (await resourceGrants.hasPage(pageId)))) return true
  }
  return false
}

const isPlainSegment = (segment: string) =>
  segment !== '' && segment !== '.' && segment !== '..' && !/[\\/]/.test(segment)

const decodePartialPath = (rawPath: string) => {
  const rawSegments = rawPath.split('/')
  if (rawSegments.length > 4) return null
  let segments: string[]
  try {
    segments = rawSegments.map(decodeURIComponent)
  } catch {
    return null
  }
  return segments.every(isPlainSegment) ? (segments.join('/') as PartialPath) : null
}

const isUnauthenticated = (error: unknown) =>
  error instanceof GraphQLError && error.extensions.code === 'UNAUTHENTICATED'

const getBearerDenialStatus = async (
  bearerToken: string,
  scope: AssetScopeEnum,
  scopeCode: string,
  assetType: AssetType
) => {
  if (assetType === 'atlassian') return '403'
  const dataLoader = getNewDataLoader('assetProxyToken')
  try {
    const grant = await getAPIGrant(bearerToken, dataLoader)
    if (!grant) return '401'
    if (!canScopesReadAsset(grant.scopes, scope, scopeCode, assetType)) return '403'
    const authToken = await getAPIAuthToken(grant, dataLoader)
    const canAccess = await checkAccess(
      authToken,
      scope,
      scopeCode,
      assetType,
      grant.resourceGrants
    )
    return canAccess ? null : '403'
  } catch (error) {
    if (isUnauthenticated(error)) return '401'
    Logger.error('Asset proxy could not check an access token', error)
    return '500'
  } finally {
    dataLoader.dispose()
  }
}

export const assetProxyHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  // Parse the raw (non-decoded) path so an encoded Atlassian URL in the filename segment
  // doesn't get its slashes expanded before we split on '/'.
  const rawPath = req.getUrl().slice('/assets/'.length)
  const segmentMatch = rawPath.match(/^([^/]+)\/([^/]+)\/([^/]+)(?:\/(.+))?$/)
  if (!segmentMatch) {
    res.writeStatus('404').end()
    return
  }
  const scope = segmentMatch[1] as AssetScopeEnum
  const scopeCode = segmentMatch[2]!
  const assetType = segmentMatch[3] as AssetType
  const rawFilename = segmentMatch[4] ?? ''

  const bearerToken = getBearerToken(req.getHeader('authorization'))
  const sessionAuthToken = getReqAuth(req)
  if (!sessionAuthToken && bearerToken) {
    const denialStatus = await getBearerDenialStatus(bearerToken, scope, scopeCode, assetType)
    if (denialStatus) {
      res.writeStatus(denialStatus).end()
      return
    }
  } else if (!(await checkAccess(sessionAuthToken, scope, scopeCode, assetType))) {
    await servePlaceholderImage(res)
    return
  }

  if (assetType === 'atlassian') {
    await atlassianProxyHandler(
      res,
      sessionAuthToken,
      scopeCode,
      rawFilename,
      servePlaceholderImage
    )
    return
  }

  const partialPath = decodePartialPath(rawPath)
  if (!partialPath) {
    res.writeStatus('404').end()
    return
  }
  const manager = await getFileStoreManager()
  const url = await redisStoreOrNetwork(
    `presignedURL:${partialPath}`,
    () => manager.presignUrl(partialPath),
    60_000
  )
  res
    .writeStatus('307')
    .writeHeader('Location', url)
    .writeHeader('Vary', 'Authorization, X-Application-Authorization')
    .writeHeader('Cache-Control', 'no-store, max-age=0')
    .end()
})
