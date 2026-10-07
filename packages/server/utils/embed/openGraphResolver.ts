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

// metascraper-publisher falls back to the alt text of a logo image, which is as often "logo" or
// "Home" as it is the site name. Rules for a property run in order, so this clears those alts
// before the publisher rules can read them.
const ignoreLogoAltText: createMetascraper.Rules = {
  publisher: ({htmlDom}) => {
    htmlDom('[class*="logo" i] img[alt]').removeAttr('alt')
    return undefined
  }
}

const scraper = createMetascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperImage(),
  metascraperLogo(),
  ignoreLogoAltText,
  metascraperPublisher()
])

/** Never produces an embedSrc. A page we had to scrape is a page that would not frame. */
export const resolveOpenGraph = async (url: string): Promise<Partial<EmbedMetadata> | null> => {
  // The tags we read sit in <head>, so a long page is cut short rather than rejected
  const result = await fetchUntrusted(url, MAX_HTML_BYTES, {
    maxRedirects: 3,
    onOverflow: 'truncate'
  })
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
