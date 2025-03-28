import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import parseBody from '../parseBody'
import {isSuperUser} from '../utils/authorization'
import getGraphQLExecutor from '../utils/getGraphQLExecutor'
import getReqAuth from '../utils/getReqAuth'
import uwsGetIP from '../utils/uwsGetIP'
import uWSAsyncHandler from './uWSAsyncHandler'

interface IntranetPayload {
  query: string
  variables: Record<string, unknown>
  isPrivate?: boolean
}

function splitString(input, maxLength = 1000000) {
  let result = []
  for (let i = 0; i < input.length; i += maxLength) {
    result.push(input.slice(i, i + maxLength))
  }
  return result
}

const intranetHttpGraphQLHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const authToken = getReqAuth(req)
  const ip = uwsGetIP(res, req)
  if (!isSuperUser(authToken)) {
    res.writeStatus('401').end()
    return
  }
  const contentType = req.getHeader('content-type')
  if (!contentType.startsWith('application/json')) {
    res.writeStatus('415').end()
    return
  }
  const body = await parseBody({res})
  if (!body) {
    res.writeStatus('422').end()
    return
  }
  const {query, variables, isPrivate} = body as any as IntranetPayload
  res.writeHeader('content-type', 'application/json, multipart/mixed; boundary="-"')
  getGraphQLExecutor().publish(
    {
      authToken,
      ip,
      query,
      variables,
      isPrivate,
      isAdHoc: true
    },
    (result) => {
      const {hasNext} = result
      const content = JSON.stringify(result)
      const chunk = Buffer.from(content, 'utf8')
      // console.log(content)
      // console.log(content.length, chunk.length)
      const data = [
        '',
        '---',
        'Content-Type: application/json; charset=utf-8',
        'Content-Length: ' + String(chunk.length),
        '',
        chunk,
        ''
      ].join('\r\n')
      // const chunks = splitString(data)
      // chunks.forEach((chunk) => res.tryEnd(chunk, 1e10))
      if (!hasNext) {
        res.end(data + '\r\n-----\r\n')
      } else {
        res.tryEnd(data, 1e12)
      }
    }
  )
}, true)

export default intranetHttpGraphQLHandler
