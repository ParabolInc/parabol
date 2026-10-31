import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import getRateLimiter from './graphql/getRateLimiter'
import uWSAsyncHandler from './graphql/uWSAsyncHandler'
import parseBody from './parseBody'
import getReqAuth from './utils/getReqAuth'
import isClientErrorBatchAllowed from './utils/isClientErrorBatchAllowed'
import {Logger} from './utils/Logger'
import logClientError from './utils/logClientError'
import parseClientErrorBatch from './utils/parseClientErrorBatch'
import uwsGetIP from './utils/uwsGetIP'

const MAX_BODY_BYTES = 64 * 1024

export const clientErrorsHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const ip = uwsGetIP(res, req)
  const userId = getReqAuth(req, false)?.sub
  if (Number(req.getHeader('content-length')) > MAX_BODY_BYTES) {
    res.writeStatus('413').end()
    return
  }
  if (!isClientErrorBatchAllowed(getRateLimiter(), ip)) {
    res.writeStatus('429').end()
    return
  }
  const reports = parseClientErrorBatch(await parseBody({res, maxBytes: MAX_BODY_BYTES}))
  if (!reports) {
    res.writeStatus('400').end()
    return
  }
  res.writeStatus('204').end()
  await Promise.all(
    reports.map((report) => logClientError(report, {userId, ip}).catch(Logger.error))
  )
})
