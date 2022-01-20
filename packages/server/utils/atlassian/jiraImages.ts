import cheerio from 'cheerio'
import base64url from 'base64url'
import crypto from 'crypto'
import ms from 'ms'
import getRedis from '../getRedis'
import AtlassianManager from 'parabol-client/utils/AtlassianManager'

export const NO_IMAGE_BUFFER = Buffer.from('X')
export const IMAGE_TTL_MS = ms('2h')

const serverSecret = process.env.SERVER_SECRET
if (!serverSecret) {
  throw new Error('Missing SERVER_SECRET environment variable!')
}

/**
 * Parses a JIRA issue description and replaces the image urls with Parabol's image urls
 * where the image urls are hashed and look like this: `/jira-attachements/<hash>.[ext]`
 * @param {string} descriptionHTML - HTML string of related Jira issue description
 * @returns {UpdateJiraImagesResult} - Record of orginal image urls to hashed image urls
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
  const imageMimeTypeKey = `jira-image:mime-type:${imageUrlHash}`

  const redis = getRedis()
  const isImageAlreadyCached = await redis.exists(imageKey)
  if (isImageAlreadyCached) return

  await redis.setBuffer(imageKey, NO_IMAGE_BUFFER, 'PX', IMAGE_TTL_MS)
  const imageResponse = await manager.getImage(imageUrl)
  if (!imageResponse || !imageResponse.contentType) {
    await redis.del(imageKey)
    return
  }

  return redis
    .multi()
    .setBuffer(imageKey, imageResponse.imageBuffer, 'PX', IMAGE_TTL_MS)
    .set(imageMimeTypeKey, imageResponse.contentType, 'PX', IMAGE_TTL_MS)
    .exec()
}

export const createParabolImageUrl = (hashedImageUrl: string) => {
  return `/jira-attachments/${hashedImageUrl}`
}

export const createImageUrlHash = (imageUrl: string) => {
  return base64url.encode(crypto.createHmac('sha256', serverSecret).update(imageUrl).digest())
}
