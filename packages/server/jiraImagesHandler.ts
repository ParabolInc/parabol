import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import fs from 'fs'
import mime from 'mime-types'
import sleep from '../client/utils/sleep'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import getRedis from './utils/getRedis'
import jiraPlaceholder from '../../static/images/jira/placeholder.png'

const jiraPlaceholderBuffer = fs.readFileSync(jiraPlaceholder)

const getImageFromCache = async (fileName: string, tryAgain: boolean) => {
  const redis = getRedis()
  const imageBuffer = await redis.getBuffer(fileName)
  if (imageBuffer === null || imageBuffer.length === 0) return null
  if (imageBuffer.length > 1) return imageBuffer
  if (tryAgain) {
    await sleep(500)
    return getImageFromCache(fileName, false)
  }
  return null
}

const servePlaceholderImage = (res: HttpResponse) => {
  res.cork(() => {
    res
      .writeStatus('200')
      .writeHeader('Content-Type', 'image/png')
      .end(jiraPlaceholderBuffer)
  })
}

const jiraImagesHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const fileName = req.getParameter(0)
  if (!fileName) {
    servePlaceholderImage(res)
    return
  }

  const mimeType = mime.lookup(fileName)
  if (!mimeType || !mimeType.startsWith('image/')) {
    servePlaceholderImage(res)
    return
  }

  const imageBuffer = await getImageFromCache(fileName, true)
  if (!imageBuffer) {
    servePlaceholderImage(res)
    return
  }

  res.cork(() => {
    res
      .writeStatus('200')
      .writeHeader('Content-Type', mimeType)
      .end(imageBuffer)
  })
})

export default jiraImagesHandler
