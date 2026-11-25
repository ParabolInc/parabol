import type {HttpResponse} from 'uWebSockets.js'

const oauthPreflightHandler = (res: HttpResponse) => {
  res.writeStatus('204 No Content')
  res.writeHeader('Access-Control-Allow-Origin', '*')
  res.writeHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.writeHeader(
    'Access-Control-Allow-Headers',
    'authorization, content-type, mcp-protocol-version'
  )
  res.writeHeader('Access-Control-Max-Age', '86400')
  res.end()
}

export default oauthPreflightHandler
