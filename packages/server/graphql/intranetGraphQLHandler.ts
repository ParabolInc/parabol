import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import parseBody from '../parseBody'
import {isAuthenticated, isSuperUser} from '../utils/authorization'
import getReqAuth from '../utils/getReqAuth'
import uwsGetIP from '../utils/uwsGetIP'
import executeGraphQL from './executeGraphQL'
import uWSAsyncHandler from './uWSAsyncHandler'

interface IntranetPayload {
  query: string
  variables: object
  isPrivate?: boolean
}
const intranetHttpGraphQLHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const authToken = getReqAuth(req)
  const ip = uwsGetIP(res, req)
  if (!isAuthenticated(authToken) || !isSuperUser(authToken)) {
    res.writeStatus('404').end()
    return
  }
  const contentType = req.getHeader('content-type')
  if (!contentType.startsWith('application/json')) {
    res.writeStatus('415').end()
    return
  }
  const body = await parseBody(res)
  if (!body) {
    res.writeStatus('422').end()
    return
  }
  const {query, variables, isPrivate} = (body as any) as IntranetPayload
  const result = await executeGraphQL({
    authToken,
    ip,
    query,
    variables,
    isPrivate,
    isAdHoc: true
  })
  res.cork(() => {
    res.writeHeader('content-type', 'application/json').end(JSON.stringify(result))
  })
})

export default intranetHttpGraphQLHandler
