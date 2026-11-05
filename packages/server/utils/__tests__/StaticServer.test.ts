import uws, {type us_listen_socket} from 'uWebSockets.js'
import crypto from 'crypto'
import fs from 'fs'
import http from 'http'
import os from 'os'
import path from 'path'
import {brotliCompressSync, brotliDecompressSync} from 'zlib'
import {acceptsEncoding} from '../../acceptsBrotli'
import {createSelfHostedHandler} from '../../selfHostedHandler'
import StaticServer, {
  ByteLRU,
  matchesETag,
  parseRange,
  readStaticRequest,
  sendStaticFile,
  sendStatus
} from '../StaticServer'

const APP = 'app_0123456789abcdef0123.js'
const MUSIC = 'music_0123456789abcdef0123.mp3'
const appBody = Buffer.from('console.log("app")\n'.repeat(2000))
// larger than the cache takes, so it's streamed from the disk
const musicBody = crypto.randomBytes(1.5 * 1024 * 1024)

let tmp: string
let listenSocket: us_listen_socket
let port: number

type Response = {status: number; headers: http.IncomingHttpHeaders; body: Buffer}
const get = (urlPath: string, headers: Record<string, string> = {}) =>
  new Promise<Response>((resolve, reject) => {
    http
      .get({host: '127.0.0.1', port, path: urlPath, headers, agent: false}, (res) => {
        const chunks: Buffer[] = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () =>
          resolve({status: res.statusCode!, headers: res.headers, body: Buffer.concat(chunks)})
        )
      })
      .on('error', reject)
  })

beforeAll(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'static-server-'))
  const build = path.join(tmp, 'build')
  fs.mkdirSync(path.join(build, 'nested'), {recursive: true})
  fs.writeFileSync(path.join(build, APP), appBody)
  fs.writeFileSync(path.join(build, `${APP}.br`), brotliCompressSync(appBody))
  fs.writeFileSync(path.join(build, MUSIC), musicBody)
  fs.writeFileSync(path.join(build, 'skeleton.html'), '<html>__PUBLIC_PATH__</html>')
  fs.writeFileSync(path.join(build, 'nested', 'style.css'), 'body{}')
  fs.mkdirSync(path.join(tmp, 'images'))
  fs.writeFileSync(path.join(tmp, 'images', 'logo.png'), 'png')
  fs.mkdirSync(path.join(tmp, 'self-hosted', 'User', 'u1', 'picture'), {recursive: true})
  fs.writeFileSync(path.join(tmp, 'self-hosted', 'User', 'u1', 'picture', 'a.png'), 'avatar')
  fs.writeFileSync(path.join(tmp, '.env'), 'SERVER_SECRET=secret')

  const staticServer = new StaticServer({
    roots: [
      {dirname: build, exclude: (name) => name === 'skeleton.html'},
      {dirname: path.join(tmp, 'images'), prefix: 'images/'},
      {dirname: path.join(tmp, 'missing')}
    ],
    files: {'sw.js': 'self.addEventListener("fetch", () => {})\n'.repeat(50)}
  })
  const app = uws
    .App()
    .get('/static/*', (res, req) => {
      const file = staticServer.get(req.getUrl().slice('/static/'.length))
      if (!file) {
        sendStatus(res, '404 Not Found')
        return
      }
      sendStaticFile(res, readStaticRequest(req), file)
    })
    .get('/self-hosted/*', createSelfHostedHandler(path.join(tmp, 'self-hosted')))
  await new Promise<void>((resolve) => {
    app.listen('127.0.0.1', 0, (socket) => {
      listenSocket = socket
      port = uws.us_socket_local_port(socket)
      resolve()
    })
  })
})

afterAll(() => {
  uws.us_listen_socket_close(listenSocket)
  fs.rmSync(tmp, {recursive: true, force: true})
})

describe('StaticServer', () => {
  it('sends the build-time brotli version to a client that accepts it', async () => {
    const res = await get(`/static/${APP}`, {'accept-encoding': 'gzip, br'})
    expect(res.status).toBe(200)
    expect(res.headers['content-encoding']).toBe('br')
    expect(brotliDecompressSync(res.body)).toEqual(appBody)
    expect(res.headers['content-type']).toBe('application/javascript; charset=utf-8')
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable')
    expect(res.headers.vary).toBe('Accept-Encoding')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
  })

  it('sends the file as it is to a client that refuses brotli', async () => {
    for (const acceptEncoding of ['gzip', 'gzip, br;q=0', '']) {
      const res = await get(`/static/${APP}`, {'accept-encoding': acceptEncoding})
      expect(res.headers['content-encoding']).toBeUndefined()
      expect(res.body).toEqual(appBody)
    }
  })

  it('answers a matching If-None-Match with 304 & no body', async () => {
    const {headers} = await get(`/static/${APP}`)
    const res = await get(`/static/${APP}`, {'if-none-match': headers.etag!})
    expect(res.status).toBe(304)
    expect(res.body.length).toBe(0)
    expect(res.headers.etag).toBe(headers.etag)
  })

  it('streams a large file & sends a single range of it', async () => {
    const whole = await get(`/static/${MUSIC}`)
    expect(whole.status).toBe(200)
    expect(whole.body.equals(musicBody)).toBe(true)
    expect(whole.headers['accept-ranges']).toBe('bytes')

    const first = await get(`/static/${MUSIC}`, {range: 'bytes=0-99'})
    expect(first.status).toBe(206)
    expect(first.headers['content-range']).toBe(`bytes 0-99/${musicBody.length}`)
    expect(first.body.equals(musicBody.subarray(0, 100))).toBe(true)

    const last = await get(`/static/${MUSIC}`, {range: 'bytes=-10'})
    expect(last.status).toBe(206)
    expect(last.body.equals(musicBody.subarray(-10))).toBe(true)
  })

  it('sends a range of a small file without brotli', async () => {
    const res = await get(`/static/${APP}`, {range: 'bytes=5-9', 'accept-encoding': 'br'})
    expect(res.status).toBe(206)
    expect(res.headers['content-encoding']).toBeUndefined()
    expect(res.body).toEqual(appBody.subarray(5, 10))
  })

  it('refuses a range past the end & sends the whole file for If-Range', async () => {
    const past = await get(`/static/${MUSIC}`, {range: `bytes=${musicBody.length}-`})
    expect(past.status).toBe(416)
    expect(past.headers['content-range']).toBe(`bytes */${musicBody.length}`)
    const conditional = await get(`/static/${MUSIC}`, {range: 'bytes=0-9', 'if-range': '"x"'})
    expect(conditional.status).toBe(200)
    expect(conditional.body.length).toBe(musicBody.length)
  })

  it('sends a file made in memory, compressed at startup & checked each time', async () => {
    const res = await get('/static/sw.js', {'accept-encoding': 'br'})
    expect(res.status).toBe(200)
    expect(res.headers['content-encoding']).toBe('br')
    expect(brotliDecompressSync(res.body).toString()).toContain('addEventListener')
    expect(res.headers['cache-control']).toBe('no-cache')
  })

  it('sends files under a prefix & in subfolders', async () => {
    expect((await get('/static/images/logo.png')).status).toBe(200)
    const css = await get('/static/nested/style.css')
    expect(css.status).toBe(200)
    expect(css.headers['content-type']).toBe('text/css; charset=utf-8')
  })

  it('only sends files on its list', async () => {
    for (const name of [
      'skeleton.html',
      `${APP}.br`,
      '../.env',
      '%2e%2e/.env',
      'constructor',
      '__proto__',
      'nested'
    ]) {
      expect((await get(`/static/${name}`)).status).toBe(404)
    }
  })
})

describe('selfHostedHandler', () => {
  it('sends an upload as an attachment', async () => {
    const res = await get('/self-hosted/User/u1/picture/a.png')
    expect(res.status).toBe(200)
    expect(res.body.toString()).toBe('avatar')
    expect(res.headers['content-disposition']).toBe('attachment')
    expect(res.headers['content-type']).toBe('image/png')
  })

  it('never leaves its folder', async () => {
    for (const urlPath of [
      '/self-hosted/../.env',
      '/self-hosted/%2e%2e/.env',
      '/self-hosted/User/../../.env',
      '/self-hosted/%2fetc%2fpasswd',
      '/self-hosted/',
      '/self-hosted/User',
      '/self-hosted/%E0%A4%A'
    ]) {
      const res = await get(urlPath)
      expect([400, 404]).toContain(res.status)
      expect(res.body.toString()).not.toContain('SERVER_SECRET')
    }
  })

  it('sends a replaced upload, not a cached copy', async () => {
    const pathname = path.join(tmp, 'self-hosted', 'User', 'u1', 'picture', 'b.png')
    fs.writeFileSync(pathname, 'first')
    fs.utimesSync(pathname, 1000, 1000)
    expect((await get('/self-hosted/User/u1/picture/b.png')).body.toString()).toBe('first')
    fs.writeFileSync(pathname, 'second!')
    fs.utimesSync(pathname, 2000, 2000)
    expect((await get('/self-hosted/User/u1/picture/b.png')).body.toString()).toBe('second!')
  })
})

describe('parsing', () => {
  it('reads Accept-Encoding q-values', () => {
    expect(acceptsEncoding('gzip, deflate, br', 'br')).toBe(true)
    expect(acceptsEncoding('br;q=0', 'br')).toBe(false)
    expect(acceptsEncoding('gzip, *;q=0.1', 'br')).toBe(true)
    expect(acceptsEncoding('*;q=0', 'br')).toBe(false)
    expect(acceptsEncoding('identity', 'br')).toBe(false)
  })

  it('matches weak & listed ETags', () => {
    expect(matchesETag('W/"a", W/"b"', 'W/"b"')).toBe(true)
    expect(matchesETag('"b"', 'W/"b"')).toBe(true)
    expect(matchesETag('*', 'W/"b"')).toBe(true)
    expect(matchesETag('', 'W/"b"')).toBe(false)
    expect(matchesETag('W/"c"', 'W/"b"')).toBe(false)
  })

  it('parses a single byte range', () => {
    expect(parseRange('bytes=0-9', 100)).toEqual({start: 0, end: 9})
    expect(parseRange('bytes=90-', 100)).toEqual({start: 90, end: 99})
    expect(parseRange('bytes=-5', 100)).toEqual({start: 95, end: 99})
    expect(parseRange('bytes=50-500', 100)).toEqual({start: 50, end: 99})
    expect(parseRange('bytes=100-', 100)).toBe('unsatisfiable')
    expect(parseRange('bytes=-0', 100)).toBe('unsatisfiable')
    expect(parseRange('bytes=0-1,5-6', 100)).toBeUndefined()
    expect(parseRange('bytes=9-1', 100)).toBeUndefined()
    expect(parseRange('items=0-1', 100)).toBeUndefined()
  })
})

describe('ByteLRU', () => {
  it('drops the least recently used past its budget', () => {
    const lru = new ByteLRU(10)
    lru.set('a', Buffer.alloc(4))
    lru.set('b', Buffer.alloc(4))
    lru.get('a')
    lru.set('c', Buffer.alloc(4))
    expect(lru.get('b')).toBeUndefined()
    expect(lru.get('a')).toBeDefined()
    expect(lru.get('c')).toBeDefined()
    expect(lru.size).toBe(8)
    lru.set('huge', Buffer.alloc(11))
    expect(lru.get('huge')).toBeUndefined()
  })
})
