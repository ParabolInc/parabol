import base64url from 'base64url'
import crypto from 'crypto'
import ms from 'ms'
import {parse} from 'node-html-parser'
import type AtlassianServerManager from '../AtlassianServerManager'
import {fetchUntrusted} from '../fetchUntrusted'
import getRedis from '../getRedis'
import {Logger} from '../Logger'

export const NO_IMAGE_BUFFER = Buffer.from('X')
export const IMAGE_TTL_MS = ms('2h')
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

const serverSecret = process.env.SERVER_SECRET
if (!serverSecret) {
  throw new Error('Missing SERVER_SECRET environment variable!')
}

/**
 * Parses a JIRA issue description and replaces the image urls with Parabol's image urls
 * where the image urls are hashed and look like this: `/jira-attachements/<image-url-hash>`
 * @param {string} cloudId
 * @param {string} descriptionHTML - HTML string of related Jira issue description
 * @returns record of orginal image urls to hashed image urls
 */
export const updateJiraImageUrls = (cloudId: string, descriptionHTML: string) => {
  const imageUrlToHash = {} as Record<string, string>
  if (!descriptionHTML) return {updatedDescription: descriptionHTML, imageUrlToHash}

  const root = parse(descriptionHTML)
  const imgTags = root.getElementsByTagName('img')
  imgTags.forEach((img) => {
    const imageUrl = img.getAttribute('src')
    if (!imageUrl) return

    // OAuth 2.0 Bearer tokens only work via the Atlassian API gateway, not direct instance URLs.
    // Convert https://{instance}.atlassian.net/rest/... to https://api.atlassian.com/ex/jira/{cloudId}/rest/...
    const fetchUrl = imageUrl.replace(
      /^https:\/\/[^.]+\.atlassian\.net\/(rest\/)/,
      `https://api.atlassian.com/ex/jira/${cloudId}/$1`
    )

    const hashedImageUrl = createImageUrlHash(fetchUrl)
    imageUrlToHash[fetchUrl] = hashedImageUrl

    img.setAttribute('src', createParabolImageUrl(hashedImageUrl))
  })
  return {updatedDescription: root.toString(), imageUrlToHash}
}

export const downloadAndCacheImages = async (
  manager: AtlassianServerManager,
  imageUrlToHash: Record<string, string>
) => {
  return Promise.all(
    Object.entries(imageUrlToHash).map(([imageUrl, hash]) =>
      downloadAndCacheImage(manager, hash, imageUrl)
    )
  )
}

export const downloadAndCacheImage = async (
  manager: AtlassianServerManager,
  imageUrlHash: string,
  imageUrl: string
) => {
  const imageKey = `jira-image:${imageUrlHash}`
  const redis = getRedis()
  const isImageAlreadyCached = await redis.exists(imageKey)
  if (isImageAlreadyCached) return

  await redis
    .multi()
    .hset(imageKey, {imageBuffer: NO_IMAGE_BUFFER, contentType: 'image/png'})
    .pexpire(imageKey, IMAGE_TTL_MS)
    .exec()
  const result = await fetchUntrusted(imageUrl, MAX_IMAGE_SIZE, {
    headers: {Authorization: `Bearer ${manager.accessToken}`},
    maxRedirects: 3
  })
  if (!result) {
    Logger.log(`Jira Image Download fail: ${imageUrl}`)
    await redis.del(imageKey)
    return
  }

  return redis
    .multi()
    .hset(imageKey, {imageBuffer: result.buffer, contentType: result.contentType})
    .pexpire(imageKey, IMAGE_TTL_MS)
    .exec()
}

export const createParabolImageUrl = (hashedImageUrl: string) => {
  return `/jira-attachments/${hashedImageUrl}`
}

export const createImageUrlHash = (imageUrl: string) => {
  return base64url.encode(crypto.createHmac('sha256', serverSecret).update(imageUrl).digest())
}
