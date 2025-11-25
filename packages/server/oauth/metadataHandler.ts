import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import appOrigin from '../appOrigin'
import {Logger} from '../utils/Logger'

export const protectedResourceMetadataHandler = (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    res.aborted = true
  })

  try {
    const url = req.getUrl()
    const method = req.getMethod()
    console.log(`[OAuth Metadata] Request: ${method} ${url}`)

    const metadata = {
      resource: `${appOrigin}/mcp`,
      authorization_servers: [appOrigin],
      scopes_supported: ['parabol:read', 'parabol:write', 'mcp:read', 'mcp:write']
    }

    console.log(`[OAuth Metadata] Sending Protected Resource Metadata`)
    res.writeStatus('200 OK')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(metadata, null, 2))
  } catch (error) {
    console.error('[OAuth Metadata] Error:', error)
    Logger.error('Protected Resource Metadata Error', error)
    if (!res.aborted) {
      res.writeStatus('500 Internal Server Error')
      res.end()
    }
  }
}

export const authorizationServerMetadataHandler = (res: HttpResponse, req: HttpRequest) => {
  res.onAborted(() => {
    res.aborted = true
  })

  try {
    const url = req.getUrl()
    const method = req.getMethod()
    console.log(`[OAuth Metadata] Request: ${method} ${url}`)

    const metadata = {
      issuer: appOrigin,
      authorization_endpoint: `${appOrigin}/oauth/authorize`,
      token_endpoint: `${appOrigin}/oauth/token`,
      scopes_supported: ['parabol:read', 'parabol:write', 'mcp:read', 'mcp:write'],
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code']
    }

    console.log(`[OAuth Metadata] Sending Authorization Server Metadata`)
    res.writeStatus('200 OK')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(metadata, null, 2))
  } catch (error) {
    console.error('[OAuth Metadata] Error:', error)
    Logger.error('Authorization Server Metadata Error', error)
    if (!res.aborted) {
      res.writeStatus('500 Internal Server Error')
      res.end()
    }
  }
}
