import {HttpRequest, HttpResponse, TemplatedApp} from 'uWebSockets.js'
import querystring from 'querystring'
import SCIMMY from 'scimmy'
import appOrigin from '../appOrigin'
import {getNewDataLoader} from '../dataloader/getNewDataLoader'
import uWSAsyncHandler from '../graphql/uWSAsyncHandler'
import parseBody from '../parseBody'
import getVerifiedAuthToken from '../utils/getVerifiedAuthToken'
import {SCIMContext} from './SCIMContext'
import './UserEgress'
import './UserIngress'
import './UserDegress'
import {decode} from 'jsonwebtoken'
import makeAppURL from '../../client/utils/makeAppURL'
import {Logger} from '../utils/Logger'
import uwsGetIP from '../utils/uwsGetIP'

SCIMMY.Config.set({
  //documentationUri: "https://example.com/docs/scim.html",
  patch: true,
  filter: true,
  bulk: false,
  authenticationSchemes: [
    {
      type: 'oauth2',
      name: 'OAuth 2.0 Authorization Framework',
      description: 'Authentication scheme using the OAuth 2.0 Authorization Framework Standard',
      specUri: 'https://datatracker.ietf.org/doc/html/rfc6749'
    },
    {
      type: 'oauthbearertoken',
      name: 'OAuth Bearer Token',
      description: 'Authentication scheme using the OAuth Bearer Token Standard',
      specUri: 'https://datatracker.ietf.org/doc/html/rfc6750'
    }
  ]
})

type Handler = (
  res: HttpResponse,
  req: {query: Record<string, string | number>; id?: string; body: Json},
  ctx: SCIMContext
) => Promise<void>
const scimHandler = (handler: Handler) =>
  uWSAsyncHandler(async (res: HttpResponse, req: HttpRequest) => {
    const dataLoader = getNewDataLoader('SCIMHandler')
    try {
      const ip = uwsGetIP(res, req)
      const authHeader =
        req.getHeader('x-application-authorization') || req.getHeader('authorization')
      const token = authHeader?.slice(7)

      // For scimAuthenticationType === bearerToken the token is unsigned as we compare it to the stored token.
      // But we want to get the scimId from it so that we know what to compare it to. For OAuth we check the signature later.
      const unverifiedToken = token ? decode(token, {json: true}) : null
      if (unverifiedToken?.aud !== 'action-scim' || !unverifiedToken.sub) {
        throw new SCIMMY.Types.Error(401, '', 'Unauthorized')
      }

      // We haven't verified the token yet, but we need to read the request before we can await on the DB request
      const query: Record<string, string | number> = {}
      new URLSearchParams(req.getQuery()).forEach((v, k) => {
        // workaround for https://github.com/scimmyjs/scimmy/issues/89
        if (['startIndex', 'count'].includes(k)) {
          const int = parseInt(v)
          if (!isNaN(int)) {
            query[k] = int
            return
          }
        }
        query[k] = v
      })
      const parameter = req.getParameter(0)
      const id = parameter !== undefined ? querystring.unescape(parameter) : undefined
      const [body, saml] = await Promise.all([
        parseBody({res}),
        dataLoader.get('saml').load(unverifiedToken.sub)
      ])
      if (!saml?.scimAuthenticationType) {
        throw new SCIMMY.Types.Error(401, '', 'SCIM not enabled for this SSO Domain')
      }

      // Verify the token
      // token was refreshed, so previous token is invalid
      if (saml.scimAuthenticationType === 'bearerToken' && saml.scimBearerToken !== token) {
        throw new SCIMMY.Types.Error(401, '', 'Unauthorized')
      }
      // Verify the signature if it's not a bearer token
      if (saml.scimAuthenticationType === 'oauthClientCredentials') {
        const authToken = getVerifiedAuthToken(token)
        if (!authToken.sub) {
          throw new SCIMMY.Types.Error(401, '', 'Unauthorized')
        }
      }

      await handler(res, {query, id, body}, {ip, authToken: unverifiedToken, dataLoader})
    } catch (err) {
      const response = new SCIMMY.Messages.Error(err as any)
      if (response.status >= 500) {
        Logger.error(err)
      }
      res
        .writeStatus(`${response.status}`)
        .writeHeader('Content-Type', 'application/scim+json')
        .end(JSON.stringify(response))
    } finally {
      dataLoader.dispose()
    }
  })

export const registerSCIMHandlers = (app: TemplatedApp, pathPrefix: string = '/scim') => {
  const route = makeAppURL(appOrigin, pathPrefix)
  SCIMMY.Resources.Schema.basepath(route)
  SCIMMY.Resources.ResourceType.basepath(route)
  SCIMMY.Resources.ServiceProviderConfig.basepath(route)
  for (let Resource of Object.values(SCIMMY.Resources.declared())) {
    Resource.basepath(route)
  }

  const addHandler = (
    path: string,
    method: 'get' | 'post' | 'put' | 'patch' | 'del',
    handler: Handler
  ) => {
    app[method](`${pathPrefix}${path}`, scimHandler(handler))
  }

  addHandler('/ServiceProviderConfig', 'get', async (res, _, ctx) => {
    res
      .writeHeader('Content-Type', 'application/json')
      .end(JSON.stringify(await new SCIMMY.Resources.ServiceProviderConfig().read(ctx)))
  })

  addHandler('/ResourceTypes', 'get', async (res, _, ctx) => {
    const resourceTypes = await new SCIMMY.Resources.ResourceType().read(ctx)
    res.writeHeader('Content-Type', 'application/scim+json').end(JSON.stringify(resourceTypes))
  })
  addHandler('/ResourceTypes/:id', 'get', async (res, {query, id}, ctx) => {
    const resourceTypes = await new SCIMMY.Resources.ResourceType(id, query).read(ctx)
    res.writeHeader('Content-Type', 'application/scim+json').end(JSON.stringify(resourceTypes))
  })

  addHandler('/Schemas', 'get', async (res, _, ctx) => {
    const resourceTypes = await new SCIMMY.Resources.Schema().read(ctx)
    res.writeHeader('Content-Type', 'application/scim+json').end(JSON.stringify(resourceTypes))
  })
  addHandler('/Schemas/:id', 'get', async (res, {id, query}, ctx) => {
    const resourceTypes = await new SCIMMY.Resources.Schema(id, query).read(ctx)
    res.writeHeader('Content-Type', 'application/scim+json').end(JSON.stringify(resourceTypes))
  })

  addHandler('/Users', 'get', async (res, {query}, ctx) => {
    const users = await new SCIMMY.Resources.User(undefined, query).read(ctx)
    res.writeHeader('Content-Type', 'application/scim+json').end(JSON.stringify(users))
  })
  addHandler('/Users', 'post', async (res, {body}, ctx) => {
    if (body === null) {
      res.writeStatus('400 Bad Request')
      return
    }
    const user = await new SCIMMY.Resources.User().write(body, ctx)
    res
      .writeStatus('201 Created')
      .writeHeader('Content-Type', 'application/scim+json')
      .end(JSON.stringify(user))
  })
  addHandler('/Users/:id', 'get', async (res, {id, query}, ctx) => {
    const user = await new SCIMMY.Resources.User(id, query).read(ctx)
    res.writeHeader('Content-Type', 'application/scim+json')
    res.end(JSON.stringify(user))
  })
  addHandler('/Users/:id', 'put', async (res, {id, query, body}, ctx) => {
    if (body === null) {
      res.writeStatus('400 Bad Request')
      return
    }
    const updatedUser = await new SCIMMY.Resources.User(id, query).write(body as any, ctx)
    res.writeHeader('Content-Type', 'application/scim+json').end(JSON.stringify(updatedUser))
  })
  addHandler('/Users/:id', 'patch', async (res, {id, query, body}, ctx) => {
    if (body === null) {
      res.writeStatus('400 Bad Request')
      return
    }
    const updatedUser = await new SCIMMY.Resources.User(id, query).patch(body as any, ctx)
    res.writeHeader('Content-Type', 'application/scim+json').end(JSON.stringify(updatedUser))
  })
  addHandler('/Users/:id', 'del', async (res, {id, query}, ctx) => {
    await new SCIMMY.Resources.User(id, query).dispose(ctx)
    res.writeStatus('204 No Content').end()
  })

  app.any(`${pathPrefix}/*`, (res) => {
    res.writeStatus('404 Not Found').end()
  })
}
