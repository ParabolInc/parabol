import sseClients from '../sseClients'
import {getUserId} from '../utils/authorization'
import sendToSentry from '../utils/sendToSentry'
import handleGraphQLTrebuchetRequest from './handleGraphQLTrebuchetRequest'
import StatelessContext from '../socketHelpers/StatelessContext'
import checkBlacklistJWT from '../utils/checkBlacklistJWT'
import {TrebuchetCloseReason} from 'parabol-client/types/constEnums'
import {HttpRequest, HttpResponse} from 'uWebSockets.js'
import uwsGetIP from '../utils/uwsGetIP'
import getReqAuth from '../utils/getReqAuth'
import {OutgoingMessage} from 'parabol-client/node_modules/@mattkrick/graphql-trebuchet-client'
import AuthToken from '../database/types/AuthToken'
import resDataToBuffer from '../resDataToBuffer'
import ConnectionContext from '../socketHelpers/ConnectionContext'

const SSE_PROBLEM_USERS = [] as string[]

// separate out the async piece so we can use the debugger (uWS iis weird like that)
const httpGraphQLAsyncHandler = async (
  res: HttpResponse,
  body: OutgoingMessage,
  connectionContext: ConnectionContext
) => {
  // sometimes a WRTC signal can slip in if it was stored in the trebuchet queue before a transport downgrade
  if (body.type !== 'start' && body.type !== 'stop') {
    res.writeStatus('400 Bad Request')
    res.end()
    return
  }

  const {id: connectionId, authToken} = connectionContext
  if (!connectionId) {
    const {iat, sub: viewerId} = authToken
    if (viewerId) {
      const isBlacklistedJWT = await checkBlacklistJWT(viewerId, iat)
      if (isBlacklistedJWT) {
        res.status(401).send(TrebuchetCloseReason.EXPIRED_SESSION)
        return
      }
    }
  }
  const response = await handleGraphQLTrebuchetRequest(body, connectionContext)
  if (response) {
    res.writeHeader('content-type', 'application/json').end(JSON.stringify(response))
  } else {
    res.writeStatus('200 OK').end()
  }
}

const httpGraphQLBufferHandler = (
  res: HttpResponse,
  authToken: AuthToken | {},
  connectionId?: string
) => (buffer: Buffer) => {
  const body = JSON.parse(buffer.toString())
  const connectionContext = connectionId
    ? sseClients.get(connectionId)
    : new StatelessContext(uwsGetIP(res), authToken)
  if (!connectionContext) {
    const viewerId = getUserId(authToken)
    if (!SSE_PROBLEM_USERS.includes(viewerId)) {
      SSE_PROBLEM_USERS.push(viewerId)
      sendToSentry(new Error('SSE response not found'), {userId: viewerId})
    }
    res.end('SSE Response not found')
    return
  }
  if (connectionId && connectionContext.authToken.sub !== (authToken as AuthToken).sub) {
    const viewerId = getUserId(authToken)
    sendToSentry(new Error('Security: Spoofed SSE connectionId'), {userId: viewerId})
    // quietly fail for cheaters
    res.writeStatus('200 OK').end()
  }
  httpGraphQLAsyncHandler(res, body, connectionContext)
}

const httpGraphQLHandler = (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    console.log('httpGraphQLHandler aborted')
  })
  const contentType = req.getHeader('content-type')
  const connectionId = req.getHeader('x-correlation-id')
  const authToken = getReqAuth(req)
  if (contentType.startsWith('application/json')) {
    resDataToBuffer(res, httpGraphQLBufferHandler(res, authToken, connectionId))
  }
}

export default httpGraphQLHandler
