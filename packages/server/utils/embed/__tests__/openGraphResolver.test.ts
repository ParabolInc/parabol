import http from 'http'
import type {AddressInfo} from 'net'

// fetchUntrusted reads __APP_VERSION__ (a build-time define) for its User-Agent
Object.assign(globalThis, {__APP_VERSION__: 'test'})
// SSRF_ALLOWED_HOSTS is read when fetchUntrusted loads, and the loopback fixture needs it
process.env.SSRF_ALLOWED_HOSTS = '127.0.0.1'

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

const JAPANESE_IN_SHIFT_JIS = Buffer.concat([
  Buffer.from('<html><head><title>'),
  Buffer.from([0x93, 0xfa, 0x96, 0x7b, 0x8c, 0xea]),
  Buffer.from('</title></head><body></body></html>')
])
const CAFE_IN_WINDOWS_1252_WITH_META = Buffer.from(
  '<html><head><meta charset="windows-1252"><title>Caf\xe9</title></head><body></body></html>',
  'latin1'
)
const CAFE_IN_UTF8 = '<html><head><title>Café</title></head><body></body></html>'

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
        case '/shift-jis':
          res.writeHead(200, {'Content-Type': 'text/html; charset=Shift_JIS'})
          return res.end(JAPANESE_IN_SHIFT_JIS)
        case '/windows-1252-meta':
          res.writeHead(200, {'Content-Type': 'text/html'})
          return res.end(CAFE_IN_WINDOWS_1252_WITH_META)
        case '/undeclared-utf8':
          res.writeHead(200, {'Content-Type': 'text/html'})
          return res.end(CAFE_IN_UTF8)
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

  test('decodes a page in the charset its Content-Type header names', async () => {
    const metadata = await resolveOpenGraph(`http://127.0.0.1:${port}/shift-jis`)
    expect(metadata?.title).toBe('日本語')
  })

  test('decodes a page in the charset its meta tag names', async () => {
    const metadata = await resolveOpenGraph(`http://127.0.0.1:${port}/windows-1252-meta`)
    expect(metadata?.title).toBe('Café')
  })

  test('reads a page that declares no charset as UTF-8', async () => {
    const metadata = await resolveOpenGraph(`http://127.0.0.1:${port}/undeclared-utf8`)
    expect(metadata?.title).toBe('Café')
  })
})
