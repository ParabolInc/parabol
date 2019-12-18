import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import resDataToBuffer from '../resDataToBuffer'
import {isAuthenticated, isSuperUser} from '../utils/authorization'
import getReqAuth from '../utils/getReqAuth'
import uwsGetIP from '../utils/uwsGetIP'
import executeGraphQL from './executeGraphQL'

const intranetHttpGraphQLHandler = async (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    console.log('intranetHttpGraphQLHandler aborted')
  })
  const authToken = getReqAuth(req)
  const ip = uwsGetIP(res)
  if (!isAuthenticated(authToken) || !isSuperUser(authToken)) {
    res.writeStatus('404 Not Found').end()
    return
  }
  const contentType = req.getHeader('content-type')
  if (!contentType.startsWith('application/json')) {
    res.writeStatus('400 Bad Request').end()
    return
  }
  resDataToBuffer(res, async (buffer) => {
    const body = JSON.parse(buffer.toString())
    const {query, variables, isPrivate} = body
    const result = await executeGraphQL({
      authToken,
      ip,
      query,
      variables,
      isPrivate,
      isAdHoc: true
    })
    res.writeHeader('content-type', 'application/json').end(JSON.stringify(result))
  })
}

export default intranetHttpGraphQLHandler
