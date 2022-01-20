import {promises as fsp} from 'fs'
import path from 'path'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import jiraPlaceholder from '../../static/images/illustrations/imageNotFound.png'
import sleep from '../client/utils/sleep'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import getRedis from './utils/getRedis'

const getImageFromCache = async (imgUrlHash: string, tryAgain: boolean) => {
  const redis = getRedis()
  const [[imageErr, imageBuffer], [mimeTypeErr, contentType]] = await redis
    .multi()
    .getBuffer(`jira-image:${imgUrlHash}`)
    .get(`jira-image:mime-type:${imgUrlHash}`)
    .exec()

  if (imageErr || mimeTypeErr) return null
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
    jiraPlaceholderBuffer = await fsp.readFile(
      path.join(__dirname, jiraPlaceholder.slice(__webpack_public_path__.length))
    )
  }
  res.cork(() => {
    res.writeStatus('200').writeHeader('Content-Type', 'image/png').end(jiraPlaceholderBuffer)
  })
}

const jiraImagesHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const imgUrlHash = req.getParameter(0)
  if (!imgUrlHash) {
    await servePlaceholderImage(res)
    return
  }

  const cachedImage = await getImageFromCache(imgUrlHash, true)
  if (!cachedImage || !cachedImage.imageBuffer || !cachedImage.contentType) {
    await servePlaceholderImage(res)
    return
  }

  res.cork(() => {
    res
      .writeStatus('200')
      .writeHeader('Content-Type', cachedImage.contentType)
      .end(cachedImage.imageBuffer)
  })
})

export default jiraImagesHandler
