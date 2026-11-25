import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import {STATUS_CODES} from 'node:http'
import {WebStandardStreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import {GraphQLError} from 'graphql'
import appOrigin from '../appOrigin'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import type {DataLoaderWorker} from '../graphql/graphql'
import OAuthScopeEnum from '../graphql/public/types/OAuthScopeEnum'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import {MCP_RESOURCE} from '../oauth2/validateOAuthAuthorizationRequest'
import parseBody from '../parseBody'
import getAPIGrant, {type APIGrant} from '../utils/getAPIGrant'
import {getBearerToken} from '../utils/getRequestCredential'
import uwsGetIP from '../utils/uwsGetIP'
import createMCPServer from './createMCPServer'
import getMCPToolset, {type MCPToolset} from './getMCPToolset'
import type {MCPContext} from './MCPContext'

const MAX_BODY_BYTES = 4 * 1024 * 1024
const TRANSPORT_HEADERS = ['accept', 'content-type', 'mcp-protocol-version']
const WWW_AUTHENTICATE = `Bearer resource_metadata="${appOrigin}/.well-known/oauth-protected-resource/mcp", scope="${Object.values(OAuthScopeEnum).join(' ')}"`

const writeResponse = async (res: HttpResponse, response: Response) => {
  const body = await response.text()
  res.writeStatus(`${response.status} ${STATUS_CODES[response.status] ?? ''}`)
  res.writeHeader('Access-Control-Allow-Origin', '*')
  res.writeHeader('Access-Control-Expose-Headers', 'www-authenticate')
  response.headers.forEach((value, key) => {
    res.writeHeader(key, value)
  })
  res.end(body)
}

const writeUnauthorized = (res: HttpResponse, message: string) =>
  writeResponse(
    res,
    Response.json(
      {error: 'invalid_token', error_description: message},
      {status: 401, headers: {'WWW-Authenticate': WWW_AUTHENTICATE}}
    )
  )

const authenticate = async (
  bearerToken: string,
  dataLoader: DataLoaderWorker
): Promise<{grant: APIGrant} | {error: string}> => {
  try {
    const grant = await getAPIGrant(bearerToken, dataLoader, MCP_RESOURCE)
    return grant ? {grant} : {error: 'Invalid access token'}
  } catch (error) {
    if (error instanceof GraphQLError && error.extensions.code === 'UNAUTHENTICATED') {
      return {error: error.message}
    }
    throw error
  }
}

const handleMCPRequest = async (context: MCPContext, toolset: MCPToolset, request: Request) => {
  const server = createMCPServer(context, toolset)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  })
  try {
    await server.connect(transport)
    return await transport.handleRequest(request)
  } finally {
    await server.close()
  }
}

const mcpHandler = uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
  const bearerToken = getBearerToken(req.getHeader('authorization'))
  if (!bearerToken) {
    await writeUnauthorized(res, 'A bearer access token is required')
    return
  }
  const ip = uwsGetIP(res, req)
  const headers = new Headers()
  TRANSPORT_HEADERS.forEach((name) => {
    const value = req.getHeader(name)
    if (value) headers.set(name, value)
  })
  const body = await parseBody({
    res,
    parser: (buffer) => buffer.toString(),
    maxBytes: MAX_BODY_BYTES
  })
  if (body === null) {
    await writeResponse(
      res,
      Response.json(
        {jsonrpc: '2.0', error: {code: -32000, message: 'Request body is too large'}, id: null},
        {status: 413}
      )
    )
    return
  }
  const dataLoader = getNewDataLoader('mcpHandler')
  try {
    const authentication = await authenticate(bearerToken, dataLoader)
    if ('error' in authentication) {
      await writeUnauthorized(res, authentication.error)
      return
    }
    const {grant} = authentication
    const context = {authorization: `Bearer ${bearerToken}`, ip, grant}
    const toolset = await getMCPToolset(grant.clientId)
    const request = new Request(MCP_RESOURCE, {method: 'POST', headers, body})
    await writeResponse(res, await handleMCPRequest(context, toolset, request))
  } finally {
    dataLoader.dispose()
  }
})

export const mcpPreflightHandler = (res: HttpResponse) => {
  res.writeStatus('204 No Content')
  res.writeHeader('Access-Control-Allow-Origin', '*')
  res.writeHeader(
    'Access-Control-Allow-Headers',
    'authorization, content-type, mcp-protocol-version'
  )
  res.writeHeader('Access-Control-Expose-Headers', 'www-authenticate')
  res.end()
}

export const mcpMethodNotAllowedHandler = (res: HttpResponse) => {
  res.writeStatus('405 Method Not Allowed')
  res.writeHeader('Allow', 'POST')
  res.writeHeader('Access-Control-Allow-Origin', '*')
  res.end()
}

export default mcpHandler
