import {createHash} from 'crypto'
import mime from 'mime-types'
import {parse} from 'node-html-parser'
import makeAppURL from 'parabol-client/utils/makeAppURL'
import appOrigin from '../../appOrigin'
import type {PartialPath} from '../../fileStorage/FileStoreManager'
import getFileStoreManager from '../../fileStorage/getFileStoreManager'
import type AtlassianServerManager from '../AtlassianServerManager'
import fetchWithRetry from '../fetchWithRetry'
import {Logger} from '../Logger'

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

const createImageUrlHash = (imageUrl: string) => {
  return createHash('sha256').update(imageUrl).digest('base64url')
}

// The reason we downloadAndCache is because Jira images may only be available to the team lead.
// We want to make the accessible to the whole team, so using the assetProxyHandler would not work
// Using the viewer's atlassian auth. If we used the team lead's auth, it would expose ANY asset if they had the URL
export const downloadAndCacheImage = async (
  manager: AtlassianServerManager,
  imageUrl: string,
  cloudId: string,
  teamId: string
): Promise<string | null> => {
  // OAuth 2.0 Bearer tokens only work via the Atlassian API gateway, not direct instance URLs.
  // Convert https://{instance}.atlassian.net/rest/... to https://api.atlassian.com/ex/jira/{cloudId}/rest/...
  const fetchUrl = imageUrl.replace(
    /^https:\/\/[^.]+\.atlassian\.net\/(rest\/)/,
    `https://api.atlassian.com/ex/jira/${cloudId}/$1`
  )
  let parsedFetchUrl: URL
  try {
    parsedFetchUrl = new URL(fetchUrl)
  } catch {
    return null
  }
  if (parsedFetchUrl.protocol !== 'https:' || parsedFetchUrl.hostname !== 'api.atlassian.com') {
    return null
  }

  let res: Response
  try {
    res = await fetchWithRetry(fetchUrl, {
      headers: {Authorization: `Bearer ${manager.accessToken}`},
      deadline: new Date(Date.now() + 20_000)
    })
  } catch (e) {
    Logger.log(`Jira Image Download fail: ${fetchUrl}`, e)
    return null
  }
  if (!res.ok) {
    await res.body?.cancel()
    Logger.log(`Jira Image Download fail: ${fetchUrl} (${res.status})`)
    return null
  }

  const contentType = res.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase()
  const ext = contentType ? mime.extension(contentType) : null
  if (!ext) {
    await res.body?.cancel()
    return null
  }

  const hash = createImageUrlHash(fetchUrl)
  const partialPath = `Team/${teamId}/assets/${hash}.${ext}` as PartialPath

  const fileStoreManager = getFileStoreManager()
  const exists = await fileStoreManager.checkExists(partialPath)
  if (exists) {
    await res.body?.cancel()
    return makeAppURL(appOrigin, `/assets/${partialPath}`)
  }

  const buffer = Buffer.from(await res.arrayBuffer())
  if (buffer.byteLength > MAX_IMAGE_SIZE) {
    Logger.log(`Jira Image too large: ${fetchUrl}`)
    return null
  }

  return fileStoreManager.putUserFile(buffer, partialPath)
}

export const processJiraImages = async (
  manager: AtlassianServerManager,
  cloudId: string,
  teamId: string,
  descriptionHTML: string
): Promise<string> => {
  if (!descriptionHTML) return descriptionHTML

  const root = parse(descriptionHTML)
  const imgTags = root.getElementsByTagName('img')
  if (imgTags.length === 0) return descriptionHTML

  await Promise.all(
    imgTags.map(async (img) => {
      const imageUrl = img.getAttribute('src')
      if (!imageUrl) return

      const hostedUrl = await downloadAndCacheImage(manager, imageUrl, cloudId, teamId)
      if (hostedUrl) img.setAttribute('src', hostedUrl)
    })
  )

  return root.toString()
}
