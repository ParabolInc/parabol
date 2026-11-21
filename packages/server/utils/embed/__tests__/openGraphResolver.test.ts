import http from 'http'
import type {AddressInfo} from 'net'

// fetchUntrusted reads __APP_VERSION__ (a build-time define) for its User-Agent
Object.assign(globalThis, {__APP_VERSION__: 'test'})
// SSRF_ALLOWED_HOSTS is read when fetchUntrusted loads, and the loopback fixture needs it
process.env.SSRF_ALLOWED_HOSTS = '127.0.0.1'

// The jest run resolves an outdated jest-environment-node from outside the
// repository, whose empty vm sandbox does not expose web globals (Blob, File,
// ReadableStream, MessageChannel, MessagePort, DOMException). metascraper's
// dependency chain (jsdom) references them at module load time, so shim them
// here before loading the resolver. No-op in any environment whose sandbox
// already provides them.
if (typeof globalThis.ReadableStream === 'undefined') {
  globalThis.ReadableStream = require('stream/web').ReadableStream
}
if (typeof globalThis.Blob === 'undefined') {
  globalThis.Blob = require('buffer').Blob
}
if (typeof globalThis.File === 'undefined') {
  globalThis.File = require('buffer').File
}
if (typeof globalThis.MessageChannel === 'undefined') {
  globalThis.MessageChannel = require('worker_threads').MessageChannel
}
if (typeof globalThis.MessagePort === 'undefined') {
  globalThis.MessagePort = require('worker_threads').MessagePort
}
if (typeof globalThis.DOMException === 'undefined') {
  globalThis.DOMException = class DOMException extends Error {
    constructor(message = '', options = {}) {
      super(message)
      this.name = 'DOMException'
      this.code = 0
      this.message = message
    }
  }
}

// Loaded here, after the two lines above, and outside any hook: metascraper is slow to load cold
const {resolveOpenGraph} = require('../openGraphResolver') as typeof import('../openGraphResolver')

const HEAD = `<!doctype html><html><head>
<title>Fallback Title</title>
<meta property="og:title" content="A Very Long Page">
<meta property="og:description" content="Its metadata sits in the head">
<meta property="og:image" content="https://cdn.example.com/cover.png">
<meta property="og:site_name" content="Example">
</head><body>`

const LOGO_ALT_PAGE = `<!doctype html><html><head>
<title>Vec in std::vec - Rust</title>
</head><body>
<a class="logo-container" href="/"><img src="/rust-logo.svg" alt="logo"></a>
</body></html>`

const PARAGRAPH = '<p>filler</p>'
// The resolver stops reading at 512KB, so this body runs well past it
const PARAGRAPHS_PER_CHUNK = 5000
const CHUNKS = 20

describe('resolveOpenGraph', () => {
  let server: http.Server
  let port: number

  beforeAll(async () => {
    server = http.createServer((req, res) => {
      switch (req.url) {
        case '/long-page':
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
          res.write(HEAD)
          for (let i = 0; i < CHUNKS; i++) res.write(PARAGRAPH.repeat(PARAGRAPHS_PER_CHUNK))
          return res.end('</body></html>')
        case '/logo-alt':
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
          return res.end(LOGO_ALT_PAGE)
        case '/windows-1252-header': {
          const page = Buffer.concat([
            Buffer.from('<html><head><title>', 'latin1'),
            Buffer.from([0xf8]),
            Buffer.from('</title></head><body></body></html>', 'latin1')
          ])
          res.writeHead(200, {'Content-Type': 'text/html; charset=windows-1252'})
          return res.end(page)
        }
        case '/shift-jis-header': {
          // 93 FA 96 7B 8C EA = "日本語" in Shift_JIS
          const page = Buffer.concat([
            Buffer.from('<html><head><title>', 'latin1'),
            Buffer.from([0x93, 0xfa, 0x96, 0x7b, 0x8c, 0xea]),
            Buffer.from('</title></head><body></body></html>', 'latin1')
          ])
          res.writeHead(200, {'Content-Type': 'text/html; charset=shift_jis'})
          return res.end(page)
        }
        case '/euc-jp-header': {
          // C6 FC CB DC B8 EC = "日本語" in EUC-JP
          const page = Buffer.concat([
            Buffer.from('<html><head><title>', 'latin1'),
            Buffer.from([0xc6, 0xfc, 0xcb, 0xdc, 0xb8, 0xec]),
            Buffer.from('</title></head><body></body></html>', 'latin1')
          ])
          res.writeHead(200, {'Content-Type': 'text/html; charset=euc-jp'})
          return res.end(page)
        }
        case '/windows-1252-meta-charset': {
          const page = Buffer.concat([
            Buffer.from('<html><head><meta charset="windows-1252"><title>', 'latin1'),
            Buffer.from([0xf8]),
            Buffer.from('</title></head><body></body></html>', 'latin1')
          ])
          res.writeHead(200, {'Content-Type': 'text/html'})
          return res.end(page)
        }
        case '/windows-1252-meta-equiv': {
          const page = Buffer.concat([
            Buffer.from('<html><head><meta http-equiv="Content-Type" content="text/html; charset=windows-1252"><title>', 'latin1'),
            Buffer.from([0xf8]),
            Buffer.from('</title></head><body></body></html>', 'latin1')
          ])
          res.writeHead(200, {'Content-Type': 'text/html'})
          return res.end(page)
        }
        case '/unsupported-charset': {
          const page = Buffer.from('<html><head><title>Safe</title></head><body></body></html>', 'utf8')
          res.writeHead(200, {'Content-Type': 'text/html; charset=x-not-a-real-charset'})
          return res.end(page)
        }
        case '/precedence-conflict': {
          // HTTP says utf-8, meta says shift_jis, body is actual Shift_JIS bytes — HTTP must win
          const page = Buffer.concat([
            Buffer.from('<html><head><meta charset="shift_jis"><title>', 'latin1'),
            Buffer.from([0x93, 0xfa, 0x96, 0x7b, 0x8c, 0xea]),
            Buffer.from('</title></head><body></body></html>', 'latin1')
          ])
          res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
          return res.end(page)
        }
        case '/bom-utf8': {
          // UTF-8 BOM wins over a conflicting meta charset
          const bom = Buffer.from([0xef, 0xbb, 0xbf])
          const html = Buffer.from('<html><head><meta charset="shift_jis"><title>Hello BOM</title></head><body>Hello BOM</body></html>', 'utf8')
          const body = Buffer.concat([bom, html])
          res.writeHead(200, {'Content-Type': 'text/html'})
          res.end(body)
          break
        }
        case '/unknown-header-falls-through': {
          // Unrecognised header charset must fall through to meta, not skip to UTF-8
          const body = Buffer.from('<html><head><meta charset="windows-1252"><title>caf\xe9</title></head><body>caf\xe9</body></html>', 'latin1')
          res.writeHead(200, {'Content-Type': 'text/html; charset=bogus-encoding'})
          res.end(body)
          break
        }
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

  test('reads the metadata of a page longer than the size cap', async () => {
    expect(await resolveOpenGraph(`http://127.0.0.1:${port}/long-page`)).toEqual({
      embedSrc: null,
      title: 'A Very Long Page',
      description: 'Its metadata sits in the head',
      thumbnailUrl: 'https://cdn.example.com/cover.png',
      faviconUrl: null,
      providerName: 'Example'
    })
  })

  test('does not take the alt text of a logo image for the site name', async () => {
    const metadata = await resolveOpenGraph(`http://127.0.0.1:${port}/logo-alt`)
    expect(metadata?.providerName).toBe('Rust')
  })

  test('decodes windows-1252 charset declared in HTTP header', async () => {
    const result = await resolveOpenGraph(`http://127.0.0.1:${port}/windows-1252-header`)
    expect(result?.title).toBe('ø')
  })

  test('decodes Shift_JIS charset declared in HTTP header', async () => {
    const result = await resolveOpenGraph(`http://127.0.0.1:${port}/shift-jis-header`)
    expect(result?.title).toBe('日本語')
  })

  test('decodes EUC-JP charset declared in HTTP header', async () => {
    const result = await resolveOpenGraph(`http://127.0.0.1:${port}/euc-jp-header`)
    expect(result?.title).toBe('日本語')
  })

  test('detects windows-1252 from <meta charset> when HTTP header has no charset', async () => {
    const result = await resolveOpenGraph(`http://127.0.0.1:${port}/windows-1252-meta-charset`)
    expect(result?.title).toBe('ø')
  })

  test('detects windows-1252 from <meta http-equiv> when HTTP header has no charset', async () => {
    const result = await resolveOpenGraph(`http://127.0.0.1:${port}/windows-1252-meta-equiv`)
    expect(result?.title).toBe('ø')
  })

  test('falls back to UTF-8 when HTTP charset is unsupported', async () => {
    const result = await resolveOpenGraph(`http://127.0.0.1:${port}/unsupported-charset`)
    expect(result?.title).toBe('Safe')
  })

  test('HTTP charset takes precedence over conflicting meta charset', async () => {
    const result = await resolveOpenGraph(`http://127.0.0.1:${port}/precedence-conflict`)
    expect(result).not.toBeNull()
    expect(result?.title).not.toBe('日本語')
  })

  it('should use UTF-8 BOM over conflicting meta charset', async () => {
    const url = `http://127.0.0.1:${port}/bom-utf8`
    const result = await resolveOpenGraph(url)
    expect(result).not.toBeNull()
    expect(result?.title).toBe('Hello BOM')
  })

  it('should fall through to meta charset when HTTP header charset is unrecognised', async () => {
    const url = `http://127.0.0.1:${port}/unknown-header-falls-through`
    const result = await resolveOpenGraph(url)
    expect(result).not.toBeNull()
    // café decoded via windows-1252 — the é byte (0xe9) maps correctly
    expect(result?.title).toContain('caf')
  })
})
