import {fetch} from '@whatwg-node/fetch'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import jiraPlaceholder from '../../static/images/illustrations/imageNotFound.png'
import sleep from '../client/utils/sleep'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import getRedis, {RedisPipelineResponse} from './utils/getRedis'
import {Logger} from './utils/Logger'

const getImageFromCache = async (
  imgUrlHash: string,
  tryAgain: boolean
): Promise<{imageBuffer: Buffer; contentType: string} | null> => {
  const redis = getRedis()
  const [[imageBufferErr, imageBuffer], [contentTypeErr, contentType]] = (await redis
    .multi()
    .hgetBuffer(`jira-image:${imgUrlHash}`, 'imageBuffer')
    .hget(`jira-image:${imgUrlHash}`, 'contentType')
    .exec()) as [RedisPipelineResponse<Buffer>, RedisPipelineResponse<string>]

  if (imageBufferErr || contentTypeErr) return null
  if (contentType === null || contentType.length === 0) return null
  if (imageBuffer === null || imageBuffer.length === 0) return null
  if (imageBuffer.length > 1) return {imageBuffer, contentType}
  if (tryAgain) {
    await sleep(500)
    return getImageFromCache(imgUrlHash, false)
  }
  return null
}

let jiraPlaceholderBuffer: Buffer | undefined
const servePlaceholderImage = async (res: HttpResponse) => {
  if (!jiraPlaceholderBuffer) {
    try {
      const res = await fetch(jiraPlaceholder)
      jiraPlaceholderBuffer = Buffer.from(await res.arrayBuffer())
    } catch (e) {
      Logger.error('Jira Placeholder image could not be fetched', e)
    }
  }
  res.writeStatus('200').writeHeader('Content-Type', 'image/png').end(jiraPlaceholderBuffer)
}

const jiraImagesHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const imgUrlHash = req.getParameter(0)
  if (!imgUrlHash) {
    await servePlaceholderImage(res)
    return
  }

  const cachedImage = await getImageFromCache(imgUrlHash, true)
  if (!cachedImage?.imageBuffer || !cachedImage?.contentType) {
    await servePlaceholderImage(res)
    return
  }

  res
    .writeStatus('200')
    .writeHeader('Content-Type', cachedImage.contentType)
    .end(cachedImage.imageBuffer)
})

export default jiraImagesHandler
