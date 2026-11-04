import type {HttpRequest, HttpResponse, TemplatedApp} from 'uWebSockets.js'
import {sign} from 'jsonwebtoken'
import getKysely from '../postgres/getKysely'
import {registerSCIMHandlers} from '../scim/SCIMHandler'
import {createPGTables, truncatePGTables} from './common'

// deleting users reaches the page editor's server, which needs the bundle's globals. A read never deletes
jest.mock('../scim/UserDegress', () => ({}))
jest.mock('../scim/GroupDegress', () => ({}))

const TEST_DB = 'scimErrorLoggingTest'
const TABLES = ['SAML', 'SAMLDomain', 'User', 'OrganizationUser']
const SCIM_TOKEN = sign({aud: 'action-scim', sub: 'acme-scim'}, 'not-checked-for-bearer-tokens')

type RouteHandler = (res: HttpResponse, req: HttpRequest) => Promise<void>

const getSCIMRoute = (method: string, pattern: string) => {
  const routes = new Map<string, RouteHandler>()
  const register = (routeMethod: string) => (routePattern: string, handler: RouteHandler) => {
    routes.set(`${routeMethod} ${routePattern}`, handler)
  }
  const app = {
    get: register('get'),
    post: register('post'),
    put: register('put'),
    patch: register('patch'),
    del: register('del'),
    any: register('any')
  } as unknown as TemplatedApp
  registerSCIMHandlers(app, '/scim')
  return routes.get(`${method} ${pattern}`)!
}

// what uWS hands a GET with no body
const makeResponse = () => {
  const res = {
    onAborted: () => res,
    onData: (callback: (chunk: ArrayBuffer, isLast: boolean) => void) => {
      callback(new ArrayBuffer(0), true)
    },
    cork: (fn: () => void) => fn(),
    end: () => res,
    writeStatus: () => res,
    writeHeader: () => res,
    getRemoteAddressAsText: () => Buffer.from('203.0.113.7')
  }
  return res as unknown as HttpResponse
}

const makeRequest = (url: string, id: string) => {
  const headers: Record<string, string> = {authorization: `Bearer ${SCIM_TOKEN}`}
  return {
    getMethod: () => 'get',
    getUrl: () => url,
    getQuery: () => 'attributes=userName',
    getHeader: (name: string) => headers[name] ?? '',
    getParameter: () => id
  } as unknown as HttpRequest
}

describe('a failed SCIM request', () => {
  const pg = getKysely(TEST_DB)
  let errorSpy: jest.SpyInstance

  beforeAll(async () => {
    await pg.schema.createSchema(TEST_DB).ifNotExists().execute()
    await createPGTables(...TABLES)
    await truncatePGTables(...TABLES)
    await pg
      .insertInto('SAML')
      .values({
        id: 'acme-scim',
        orgId: 'orgAcme',
        scimAuthenticationType: 'bearerToken',
        scimBearerToken: SCIM_TOKEN
      })
      .execute()
    await pg.insertInto('SAMLDomain').values({domain: 'acme.co', samlId: 'acme-scim'}).execute()
  })

  beforeEach(() => {
    Reflect.set(globalThis, '__PRODUCTION__', true)
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    Reflect.set(globalThis, '__PRODUCTION__', false)
    errorSpy.mockRestore()
  })

  afterAll(async () => {
    await pg.schema.dropSchema(TEST_DB).cascade().execute()
    await pg.destroy()
  })

  test('is logged with its tenant org, route, status and query', async () => {
    const handler = getSCIMRoute('get', '/scim/Users/:id')
    await handler(makeResponse(), makeRequest('/scim/Users/missingUser', 'missingUser'))
    const record = JSON.parse(errorSpy.mock.calls[0][0])
    expect(record).toMatchObject({
      severity: 'ERROR',
      message: 'User not found',
      orgId: 'orgAcme',
      http: {
        method: 'GET',
        route: '/scim/Users/:id',
        path: '/scim/Users/missingUser',
        status: 404,
        query: {attributes: 'userName'}
      }
    })
  })
})
