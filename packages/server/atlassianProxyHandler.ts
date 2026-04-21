import type {HttpResponse} from 'uWebSockets.js'
import type AuthToken from './database/types/AuthToken'
import {getNewDataLoader} from './dataloader/getNewDataLoader'
import {getUserId} from './utils/authorization'
import fetchWithRetry from './utils/fetchWithRetry'
import {Logger} from './utils/Logger'

export const atlassianProxyHandler = async (
  res: HttpResponse,
  authToken: AuthToken | null,
  teamId: string,
  rawFilename: string,
  servePlaceholderImage: (res: HttpResponse) => Promise<void>
): Promise<void> => {
  const atlassianUrl = decodeURIComponent(rawFilename)
  if (!atlassianUrl.startsWith('https://api.atlassian.com/')) {
    res.writeStatus('400').end()
    return
  }

  const viewerId = getUserId(authToken)
  const dataLoader = getNewDataLoader('atlassianProxy')
  const auth = await dataLoader.get('freshAtlassianAuth').load({teamId, userId: viewerId})
  dataLoader.dispose()
  if (!auth) {
    await servePlaceholderImage(res)
    return
  }

  try {
    const atlassianRes = await fetchWithRetry(atlassianUrl, {
      headers: {Authorization: `Bearer ${auth.accessToken}`},
      deadline: new Date(Date.now() + 20_000)
    })
    if (!atlassianRes.ok) {
      await atlassianRes.body?.cancel()
      await servePlaceholderImage(res)
      return
    }
    const contentType = atlassianRes.headers.get('content-type') || 'application/octet-stream'
    const cacheControl = atlassianRes.headers.get('cache-control')
    const etag = atlassianRes.headers.get('etag')
    res.writeStatus('200').writeHeader('Content-Type', contentType)
    if (cacheControl) res.writeHeader('Cache-Control', cacheControl)
    if (etag) res.writeHeader('ETag', etag)
    res.end(await atlassianRes.arrayBuffer())
  } catch (e) {
    Logger.error('Atlassian proxy error', e)
    await servePlaceholderImage(res)
  }
}
