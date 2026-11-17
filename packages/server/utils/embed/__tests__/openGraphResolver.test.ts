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
})
