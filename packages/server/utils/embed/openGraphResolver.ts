import type createMetascraper from 'metascraper'
import type {EmbedMetadata} from '../../../client/shared/embed/embedTypes'
import {fetchUntrusted} from '../fetchUntrusted'
import {Logger} from '../Logger'

const MAX_HTML_BYTES = 512_000

// metascraper-publisher falls back to the alt text of a logo image, which is as often "logo" or
// "Home" as it is the site name. Rules for a property run in order, so this clears those alts
// before the publisher rules can read them.
const ignoreLogoAltText: createMetascraper.Rules = {
  publisher: ({htmlDom}) => {
    htmlDom('[class*="logo" i] img[alt]').removeAttr('alt')
    return undefined
  }
}

let scraper: Promise<ReturnType<typeof createMetascraper>> | undefined
// metascraper & its rules are a lot of code, so the first page to scrape loads them instead of every server's startup
const getScraper = () => {
  scraper ??= Promise.all([
    import(/* webpackMode: "eager" */ 'metascraper'),
    import(/* webpackMode: "eager" */ 'metascraper-title'),
    import(/* webpackMode: "eager" */ 'metascraper-description'),
    import(/* webpackMode: "eager" */ 'metascraper-image'),
    import(/* webpackMode: "eager" */ 'metascraper-logo'),
    import(/* webpackMode: "eager" */ 'metascraper-publisher')
  ]).then(
    ([
      {default: createMetascraper},
      {default: metascraperTitle},
      {default: metascraperDescription},
      {default: metascraperImage},
      {default: metascraperLogo},
      {default: metascraperPublisher}
    ]) =>
      createMetascraper([
        metascraperTitle(),
        metascraperDescription(),
        metascraperImage(),
        metascraperLogo(),
        ignoreLogoAltText,
        metascraperPublisher()
      ])
  )
  return scraper
}

// Detect a leading byte-order mark (BOM) and return its implied encoding.
function detectBOM(buffer: Buffer): string | null {
  if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) return 'utf-8'
  if (buffer[0] === 0xff && buffer[1] === 0xfe) return 'utf-16le'
  if (buffer[0] === 0xfe && buffer[1] === 0xff) return 'utf-16be'
  return null
}

// Scan the first 4096 bytes of the buffer for a meta charset declaration.
// The buffer is decoded as latin1 so every byte survives intact as a character.
function detectMetaCharset(buffer: Buffer): string | null {
  const snippet = buffer.slice(0, 4096).toString('latin1')
  // <meta charset="shift_jis"> or <meta charset=shift_jis>
  const metaCharset = /<meta[^>]+charset\s*=\s*["']?\s*([^"';\s>]+)/i.exec(snippet)
  if (metaCharset) return metaCharset[1]!.trim().toLowerCase()
  // <meta http-equiv="Content-Type" content="text/html; charset=euc-jp">
  const httpEquiv = /<meta[^>]+http-equiv\s*=\s*["']content-type["'][^>]+content\s*=\s*["'][^"']*charset=([^"';\s>]+)/i.exec(snippet)
  if (httpEquiv) return httpEquiv[1]!.trim().toLowerCase()
  return null
}

function isKnownCharset(label: string): boolean {
  try {
    new TextDecoder(label)
    return true
  } catch {
    return false
  }
}

function decodeBuffer(buffer: Buffer, charset: string): string {
  try {
    return new TextDecoder(charset, {fatal: false}).decode(buffer)
  } catch {
    return buffer.toString('utf8')
  }
}

/** Never produces an embedSrc. A page we had to scrape is a page that would not frame. */
export const resolveOpenGraph = async (url: string): Promise<Partial<EmbedMetadata> | null> => {
  // The tags we read sit in <head>, so a long page is cut short rather than rejected
  const result = await fetchUntrusted(url, MAX_HTML_BYTES, {
    maxRedirects: 3,
    onOverflow: 'truncate'
  })
  if (!result) return null
  if (!result.contentType.startsWith('text/html')) return null
  // HTTP Content-Type charset takes precedence (only if recognised); then BOM; then <meta charset>;
  // then any declared header charset; finally UTF-8
  const charset =
    detectBOM(result.buffer) ??
    (result.charset && isKnownCharset(result.charset) ? result.charset : null) ??
    detectMetaCharset(result.buffer) ??
    result.charset ??
    'utf-8'
  const html = decodeBuffer(result.buffer, charset)
  try {
    const scrape = await getScraper()
    const metadata = await scrape({url, html})
    return {
      embedSrc: null,
      title: metadata.title ?? null,
      description: metadata.description ?? null,
      thumbnailUrl: metadata.image ?? null,
      faviconUrl: metadata.logo ?? null,
      providerName: metadata.publisher ?? null
    }
  } catch (e) {
    Logger.debug(`Open Graph scrape failed for ${new URL(url).hostname}`, e)
    return null
  }
}
