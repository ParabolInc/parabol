import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import {NO_IMAGE_BUFFER, JIRA_IMAGES_ENDPOINT} from './utils/atlassian/jiraImages'
import getRedis from './utils/getRedis'

const WAIT_MS = 500

function wait(delayMS: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMS))
}

const getImageFromCache = async (fileName: string) => {
  const redis = getRedis()
  let imageBuffer = await redis.getBuffer(fileName)
  if (imageBuffer.compare(NO_IMAGE_BUFFER) === 0) {
    await wait(WAIT_MS) // try again after 500 ms
    imageBuffer = await redis.getBuffer(fileName)
  }
  return imageBuffer
}

const ROUTE = `${JIRA_IMAGES_ENDPOINT}/`
const jiraImagesHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const fileName = req.getUrl().slice(ROUTE.length)
  const imageBuffer = await getImageFromCache(fileName)
  if (imageBuffer.compare(NO_IMAGE_BUFFER) === 0) {
    //TODO: send placeholder image
  }

  res
    .writeStatus('200')
    .writeHeader('Content-Type', 'image/png')
    .writeHeader('Content-Length', imageBuffer.length.toString())
    .end(imageBuffer)
})

export default jiraImagesHandler
