import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import safetyPatchRes from '../safetyPatchRes'
import getReqAuth from '../utils/getReqAuth'
import sendToSentry from '../utils/sendToSentry'

export type uWSHandler = (res: HttpResponse, req: HttpRequest) => void
const uWSAsyncHandler =
  (handler: uWSHandler, ignoreDone?: boolean) => async (res: HttpResponse, req: HttpRequest) => {
    const authToken = getReqAuth(req)
    safetyPatchRes(res)
    try {
      await handler(res, req)
      if (!ignoreDone && !res.done) {
        throw new Error('Async handler did not respond')
      }
    } catch (e) {
      res.writeStatus('503').end()
      const error = e instanceof Error ? e : new Error('uWSAsyncHandler failed')
      sendToSentry(error, {userId: authToken.sub})
    }
  }

export default uWSAsyncHandler
