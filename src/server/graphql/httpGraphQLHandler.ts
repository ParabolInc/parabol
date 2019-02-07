import e from 'express'
import queryMap from 'server/graphql/queryMap.json'
import {getUserId} from '../utils/authorization'
import sendToSentry from '../utils/sendToSentry'
import handleGraphQLTrebuchetRequest from './handleGraphQLTrebuchetRequest'
import isQueryAllowed from './isQueryAllowed'

export default (sharedDataLoader, rateLimiter, sseClients) => async (
  req: e.Request,
  res: e.Response
) => {
  const connectionId = req.headers['x-correlation-id']
  const authToken = req.user || {}
  const connectionContext = connectionId
    ? sseClients[connectionId as string]
    : {sharedDataLoader, rateLimiter, authToken}
  if (!connectionContext) {
    const viewerId = getUserId(authToken)
    sendToSentry(new Error('SSE response not found'), {userId: viewerId})
    res.send('SSE Response not found')
    return
  }
  if (connectionId && connectionContext.authToken.sub !== authToken.sub) {
    const viewerId = getUserId(authToken)
    sendToSentry(new Error('Security: Spoofed SSE connectionId'), {userId: viewerId})
    // quietly fail for cheaters
    res.sendStatus(200)
  }

  try {
    const response = await handleGraphQLTrebuchetRequest(req.body, connectionContext, {
      persistedQueries: queryMap,
      isQueryAllowed
    })
    if (response) {
      res.send(response)
    } else {
      res.sendStatus(200)
    }
  } catch (e) {
    const viewerId = getUserId(authToken)
    sendToSentry(e, {userId: viewerId})
    res.send(e.message)
    return
  }
}
