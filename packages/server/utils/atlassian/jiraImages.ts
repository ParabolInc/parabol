import base64url from 'base64url'
import cheerio from 'cheerio'
import crypto from 'crypto'
import ms from 'ms'
import AtlassianManager from 'parabol-client/utils/AtlassianManager'
import getRedis from '../getRedis'

export const NO_IMAGE_BUFFER = Buffer.from('X')
export const IMAGE_TTL_MS = ms('2h')

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
  const projectBaseUrl = `https://api.atlassian.com/ex/jira/${cloudId}`

  const $ = cheerio.load(descriptionHTML)
  $('body')
    .find('img')
    .each((_i, img) => {
      const imageUrl = $(img).attr('src')
      if (!imageUrl) return

      const absoluteImageUrl = `${projectBaseUrl}${imageUrl}`
      const hashedImageUrl = createImageUrlHash(absoluteImageUrl)
      imageUrlToHash[absoluteImageUrl] = hashedImageUrl

      $(img).attr('src', createParabolImageUrl(hashedImageUrl))
    })

  return {updatedDescription: $.html(), imageUrlToHash}
}

export const downloadAndCacheImages = async (
  manager: AtlassianManager,
  imageUrlToHash: Record<string, string>
) => {
  return Promise.all(
    Object.entries(imageUrlToHash).map(([imageUrl, hash]) =>
      downloadAndCacheImage(manager, hash, imageUrl)
    )
  )
}

export const downloadAndCacheImage = async (
  manager: AtlassianManager,
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
  const imageResponse = await manager.getImage(imageUrl)
  if (!imageResponse?.contentType) {
    await redis.hdel(imageKey)
    return
  }

  return redis.multi().hset(imageKey, imageResponse).pexpire(imageKey, IMAGE_TTL_MS).exec()
}

export const createParabolImageUrl = (hashedImageUrl: string) => {
  return `/jira-attachments/${hashedImageUrl}`
}

export const createImageUrlHash = (imageUrl: string) => {
  return base64url.encode(crypto.createHmac('sha256', serverSecret).update(imageUrl).digest())
}
