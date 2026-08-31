import createMetascraper from 'metascraper'
import metascraperDescription from 'metascraper-description'
import metascraperImage from 'metascraper-image'
import metascraperLogo from 'metascraper-logo'
import metascraperPublisher from 'metascraper-publisher'
import metascraperTitle from 'metascraper-title'
import type {EmbedMetadata} from '../../../client/shared/embed/embedTypes'
import {fetchUntrusted} from '../fetchUntrusted'
import {Logger} from '../Logger'

const MAX_HTML_BYTES = 512_000

const scraper = createMetascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
  metascraperLogo(),
  metascraperPublisher()
])

/** Never produces an embedSrc. A page we had to scrape is a page that would not frame. */
export const resolveOpenGraph = async (url: string): Promise<Partial<EmbedMetadata> | null> => {
  const result = await fetchUntrusted(url, MAX_HTML_BYTES, {maxRedirects: 3})
  if (!result) return null
  if (!result.contentType.startsWith('text/html')) return null
  try {
    const metadata = await scraper({url, html: result.buffer.toString('utf8')})
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
