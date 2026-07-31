import http from 'http'
import type {AddressInfo} from 'net'

// fetchUntrusted reads __APP_VERSION__ (a build-time define) for its User-Agent
Object.assign(globalThis, {__APP_VERSION__: 'test'})

// SSRF_ALLOWED_HOSTS is read when the module loads, so each scenario needs a fresh copy
const loadFetchUntrusted = (allowedHosts?: string) => {
  jest.resetModules()
  if (allowedHosts === undefined) {
    delete process.env.SSRF_ALLOWED_HOSTS
  } else {
    process.env.SSRF_ALLOWED_HOSTS = allowedHosts
  }
  return require('../fetchUntrusted') as typeof import('../fetchUntrusted')
}

// A loopback server stands in for a self-hosted integration on a private network. Reaching it at all
// requires the allowlist, which is what makes it a usable fixture for the rest of the behavior.
const LOOPBACK_HOSTS = 'localhost,127.0.0.1'

describe('fetchUntrusted', () => {
  let server: http.Server
  let port: number
  let authSeenByServer: string | null
  let rateLimitedCalls: number

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      const path = req.url ?? '/'
      const json = (body: unknown) => {
        res.writeHead(200, {'Content-Type': 'application/json'})
        res.end(JSON.stringify(body))
      }
      const redirect = (location: string) => {
        res.writeHead(302, {location})
        res.end()
      }

      switch (path) {
        case '/ok':
          return json({ok: true})
        case '/no-type':
          res.writeHead(200)
          return res.end('body without a content-type')
        case '/big':
          // content-length is present, so the declared-size pre-check should fire
          res.writeHead(200, {'Content-Type': 'text/plain'})
          return res.end('x'.repeat(100_000))
        case '/big-chunked': {
          // no content-length, so only the streaming cap can stop this
          res.writeHead(200, {'Content-Type': 'text/plain'})
          for (let i = 0; i < 10; i++) res.write('x'.repeat(10_000))
          return res.end()
        }
        case '/rate-limited':
          rateLimitedCalls++
          if (rateLimitedCalls === 1) {
            res.writeHead(429, {'retry-after': '1'})
            return res.end()
          }
          return json({ok: true})
        case '/redirect-once':
          return redirect('/ok')
        case '/redirect-twice':
          return redirect('/redirect-once')
        case '/redirect-same-origin':
          return redirect('/echo-auth')
        case '/redirect-cross-origin':
          return redirect(`http://localhost:${port}/echo-auth`)
        case '/redirect-to-blocked':
          return redirect(`http://127.0.0.1:${port}/ok`)
        case '/redirect-to-file':
          return redirect('file:///etc/passwd')
        case '/echo-auth':
          authSeenByServer = req.headers.authorization ?? null
          return json({auth: req.headers.authorization ?? null})
        default:
          res.writeHead(404)
          return res.end()
      }
    })
    await new Promise<void>((resolve) => server.listen(0, resolve))
    port = (server.address() as AddressInfo).port
  })

  afterAll(async () => {
    // keepAlive sockets would otherwise hold the server open
    server.closeAllConnections()
    await new Promise((resolve) => server.close(resolve))
  })

  beforeEach(() => {
    authSeenByServer = null
    rateLimitedCalls = 0
  })

  const get = (
    mod: typeof import('../fetchUntrusted'),
    path: string,
    maxSize = 1_000_000,
    options?: {headers?: Record<string, string>; maxRedirects?: number},
    host = '127.0.0.1'
  ) => mod.fetchUntrusted(`http://${host}:${port}${path}`, maxSize, options)

  describe('SSRF guard', () => {
    test('blocks a private IP when the allowlist is empty', async () => {
      expect(await get(loadFetchUntrusted(), '/ok')).toBe(null)
    })

    test('connects when the host is allowlisted', async () => {
      const res = await get(loadFetchUntrusted(LOOPBACK_HOSTS), '/ok')
      expect(res?.buffer.toString()).toBe('{"ok":true}')
      expect(res?.contentType).toBe('application/json')
    })

    test('rejects non-http protocols, which the ponyfill would otherwise resolve', async () => {
      const mod = loadFetchUntrusted(LOOPBACK_HOSTS)
      expect(await mod.fetchUntrusted('file:///etc/passwd', 1_000_000)).toBe(null)
      expect(await mod.fetchUntrusted('data:text/plain,hello', 1_000_000)).toBe(null)
    })

    test('blocks a redirect that leaves the allowlist', async () => {
      // 'localhost' is allowlisted, the literal 127.0.0.1 it redirects to is not
      const mod = loadFetchUntrusted('localhost')
      expect(
        await get(mod, '/redirect-to-blocked', 1_000_000, {maxRedirects: 2}, 'localhost')
      ).toBe(null)
    })

    test('blocks a redirect to a non-http protocol', async () => {
      const mod = loadFetchUntrusted(LOOPBACK_HOSTS)
      expect(await get(mod, '/redirect-to-file', 1_000_000, {maxRedirects: 2})).toBe(null)
    })
  })

  describe('redirects', () => {
    test('refuses to follow by default', async () => {
      expect(await get(loadFetchUntrusted(LOOPBACK_HOSTS), '/redirect-once')).toBe(null)
    })

    test('follows within the budget', async () => {
      const res = await get(loadFetchUntrusted(LOOPBACK_HOSTS), '/redirect-once', 1_000_000, {
        maxRedirects: 1
      })
      expect(res?.buffer.toString()).toBe('{"ok":true}')
    })

    test('caps the number of hops', async () => {
      const mod = loadFetchUntrusted(LOOPBACK_HOSTS)
      expect(await get(mod, '/redirect-twice', 1_000_000, {maxRedirects: 1})).toBe(null)
      expect(
        (await get(mod, '/redirect-twice', 1_000_000, {maxRedirects: 2}))?.buffer.toString()
      ).toBe('{"ok":true}')
    })

    test('keeps Authorization on a same-origin hop', async () => {
      const mod = loadFetchUntrusted(LOOPBACK_HOSTS)
      await get(mod, '/redirect-same-origin', 1_000_000, {
        maxRedirects: 1,
        headers: {Authorization: 'Bearer secret'}
      })
      expect(authSeenByServer).toBe('Bearer secret')
    })

    test('strips Authorization on a cross-origin hop', async () => {
      const mod = loadFetchUntrusted(LOOPBACK_HOSTS)
      const res = await get(mod, '/redirect-cross-origin', 1_000_000, {
        maxRedirects: 1,
        headers: {Authorization: 'Bearer secret'}
      })
      expect(res?.buffer.toString()).toBe('{"auth":null}')
      expect(authSeenByServer).toBe(null)
    })
  })

  describe('response handling', () => {
    test('enforces maxSize via the declared content-length', async () => {
      expect(await get(loadFetchUntrusted(LOOPBACK_HOSTS), '/big', 1000)).toBe(null)
    })

    test('enforces maxSize while streaming a chunked body', async () => {
      expect(await get(loadFetchUntrusted(LOOPBACK_HOSTS), '/big-chunked', 1000)).toBe(null)
    })

    test('accepts a body under maxSize', async () => {
      const res = await get(loadFetchUntrusted(LOOPBACK_HOSTS), '/big-chunked', 1_000_000)
      expect(res?.size).toBe(100_000)
    })

    test('rejects a response with no Content-Type', async () => {
      expect(await get(loadFetchUntrusted(LOOPBACK_HOSTS), '/no-type')).toBe(null)
    })

    test('rejects a non-2xx response', async () => {
      expect(await get(loadFetchUntrusted(LOOPBACK_HOSTS), '/missing')).toBe(null)
    })

    test('retries once on 429 and honors Retry-After', async () => {
      const res = await get(loadFetchUntrusted(LOOPBACK_HOSTS), '/rate-limited')
      expect(res?.buffer.toString()).toBe('{"ok":true}')
      expect(rateLimitedCalls).toBe(2)
    }, 10_000)
  })

  describe('postUntrusted', () => {
    const post = (mod: typeof import('../fetchUntrusted'), host: string) =>
      mod.postUntrusted(`http://${host}:${port}/echo-auth`, {body: '{}'})

    test('blocks a private IP when the allowlist is empty', async () => {
      expect(await post(loadFetchUntrusted(), '127.0.0.1')).toBe(null)
    })

    test('connects when the exact IP is allowlisted', async () => {
      const res = await post(loadFetchUntrusted('127.0.0.1'), '127.0.0.1')
      expect(res?.status).toBe(200)
      expect(res?.headers.get('content-type')).toBe('application/json')
      expect(await res?.json()).toEqual({auth: null})
    })

    test('connects when a CIDR range covers the IP', async () => {
      expect((await post(loadFetchUntrusted('127.0.0.0/8'), '127.0.0.1'))?.status).toBe(200)
    })

    test('connects when the hostname is allowlisted', async () => {
      expect((await post(loadFetchUntrusted('localhost'), 'localhost'))?.status).toBe(200)
    })

    test('still blocks a private host that is not on the allowlist', async () => {
      expect(await post(loadFetchUntrusted('mattermost.internal,10.0.0.0/8'), '127.0.0.1')).toBe(
        null
      )
    })
  })
})
