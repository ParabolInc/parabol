import {promises as fsp} from 'fs'
import path from 'path'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import jiraPlaceholder from '../../static/images/illustrations/imageNotFound.png'
import sleep from '../client/utils/sleep'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import getRedis from './utils/getRedis'

const getImageFromCache = async (fileName: string, tryAgain: boolean) => {
  const imageKey = `jira-image:${fileName}`
  const redis = getRedis()
  const imageBuffer = await redis.getBuffer(imageKey)
  if (imageBuffer === null || imageBuffer.length === 0) return null
  if (imageBuffer.length > 1) return imageBuffer
  if (tryAgain) {
    await sleep(500)
    return getImageFromCache(imageKey, false)
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
  const fileName = req.getParameter(0)
  if (!fileName) {
    await servePlaceholderImage(res)
    return
  }

  const redis = getRedis()
  const mimeType = await redis.get(`jira-image:mime-type:${fileName}`)
  if (!mimeType || !mimeType.startsWith('image/')) {
    await servePlaceholderImage(res)
    return
  }

  const imageBuffer = await getImageFromCache(fileName, true)
  if (!imageBuffer) {
    await servePlaceholderImage(res)
    return
  }

  res.cork(() => {
    res.writeStatus('200').writeHeader('Content-Type', mimeType).end(imageBuffer)
  })
})

export default jiraImagesHandler
