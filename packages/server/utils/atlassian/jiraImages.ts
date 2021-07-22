import cheerio from 'cheerio'
import base64url from 'base64url'
import crypto from 'crypto'
import path from 'path'
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
      const extname = path.extname(absoluteImageUrl)
      const imageUrlWithoutExt = absoluteImageUrl.replace(extname, '')
      const hashedImageUrl = createImageUrlHash(imageUrlWithoutExt)
      const hashedImageWithExt = `${hashedImageUrl}${extname}`
      imageUrlToHash[absoluteImageUrl] = hashedImageWithExt

      $(img).attr('src', createParabolImageUrl(hashedImageWithExt))
    })

  return {updatedDescription: $.html(), imageUrlToHash}
}

export const downloadAndCacheImages = async (
  manager: AtlassianManager,
  imageUrlToHash: Record<string, string>
) => {
  await Promise.all(
    Object.entries(imageUrlToHash).map(([imageUrl, hash]) =>
      downloadAndCacheImage(manager, hash, imageUrl)
    )
  )
}

const createParabolImageUrl = (hashedImageUrl: string) => {
  return `/jira-attachements/${hashedImageUrl}`
}

const downloadAndCacheImage = async (
  manager: AtlassianManager,
  hashedImageUrl: string,
  imageUrl: string
) => {
  const redis = getRedis()
  const isImageAlreadyCached = await redis.exists(hashedImageUrl)
  if (isImageAlreadyCached) return

  redis.setBuffer(hashedImageUrl, NO_IMAGE_BUFFER, 'PX', IMAGE_TTL_MS)
  const imageBuffer = await manager.getImage(imageUrl)
  if (!imageBuffer) {
    await redis.del(hashedImageUrl)
    return
  }
  redis.setBuffer(hashedImageUrl, imageBuffer, 'PX', IMAGE_TTL_MS)
}

const createImageUrlHash = (imageUrl: string) => {
  return base64url.encode(
    crypto
      .createHmac('sha256', serverSecret)
      .update(imageUrl)
      .digest('base64')
  )
}
