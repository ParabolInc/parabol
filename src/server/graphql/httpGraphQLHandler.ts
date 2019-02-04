import e from 'express'
import queryMap from 'server/graphql/queryMap.json'
import sendSentryEvent from 'server/utils/sendSentryEvent'
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
    // TODO send to sentry
    res.send('SSE Response not found')
    return
  }
  if (connectionId && connectionContext.authToken.sub !== authToken.sub) {
    sendSentryEvent(
      connectionContext.authToken,
      undefined,
      new Error('Security: Spoofed SSE connectionId')
    )
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
    sendSentryEvent(connectionContext.authToken, undefined, e)
    res.send(e.message)
    return
  }
}
