import cheerio from 'cheerio'
import crypto from 'crypto'
import fetch from 'node-fetch'
import Redis from 'ioredis'
import ms from 'ms'
import getRedis from '../getRedis'
import PROD from '../../PROD'

export const NO_IMAGE_BUFFER = Buffer.from('X')
export const IMAGE_TTL_MS = ms('2h')
export const JIRA_IMAGES_ENDPOINT = '/jira-attachemenets'

type UpdateJiraImagesResult = {
  updatedDescription: string
  imageUrlToHash: Map<string, string>
}

/**
 * Parses a JIRA issue description and replaces the image urls with Parabol's image urls
 * @param {string} descriptionHTML - HTML string of related Jira issue description
 * @returns {UpdateJiraImagesResult} - Map of orginal image urls to hashed image urls and updated description
 */
export const updateJiraImageUrls = (
  cloudId: string,
  descriptionHTML: string
): UpdateJiraImagesResult => {
  const imageUrlToHash: Map<string, string> = new Map()
  const projectBaseUrl = `https://api.atlassian.com/ex/jira/${cloudId}`

  const $ = cheerio.load(descriptionHTML)
  $('body')
    .find('img')
    .each((_i, img) => {
      const imageUrl = $(img).attr('src')
      if (!imageUrl) return

      const absoluteImageUrl = `${projectBaseUrl}${imageUrl}`
      const hashedImageUrl = createImageUrlHash(absoluteImageUrl)
      imageUrlToHash.set(absoluteImageUrl, hashedImageUrl)

      $(img).attr('src', createParabolImageUrl(hashedImageUrl))
    })

  return {updatedDescription: $.html(), imageUrlToHash}
}

export const createParabolImageUrl = (hashedImageUrl: string): string => {
  //locally API lives on different port than the frontend application
  return `${
    !PROD ? `http://localhost:${process.env.SOCKET_PORT}` : ''
  }${JIRA_IMAGES_ENDPOINT}/${hashedImageUrl}`
}

export const downloadAndCacheImages = async (
  authToken: string,
  imageUrlToHash: Map<string, string>
) => {
  const redis = getRedis()
  const promises: Promise<void>[] = []
  for (const [imageUrl, hashedImageUrl] of imageUrlToHash) {
    const cachedImage = await redis.get(hashedImageUrl)
    if (cachedImage) return // skip if already cached

    promises.push(downloadAndCacheImage(redis, authToken, hashedImageUrl, imageUrl))
  }

  await Promise.all(promises)
}

export const downloadAndCacheImage = async (
  redis: Redis.Redis,
  authToken: string,
  hashedImageUrl: string,
  imageUrl: string
) => {
  try {
    redis.setBuffer(hashedImageUrl, NO_IMAGE_BUFFER)
    const imageBuffer = await fetchImage(authToken, imageUrl)
    redis.setBuffer(hashedImageUrl, imageBuffer, 'PX', IMAGE_TTL_MS)
  } catch (error) {
    console.error(error)
  }
}

export const fetchImage = async (authToken: string, url: string): Promise<Buffer> => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  })
  return response.buffer()
}

export const createImageUrlHash = (imageUrl: string): string => {
  const serverSecret = process.env.SERVER_SECRET
  if (!serverSecret) {
    throw new Error('Missing SERVER_SECRET environment variable!')
  }

  return crypto
    .createHmac('sha256', serverSecret)
    .update(imageUrl)
    .digest('base64')
}
