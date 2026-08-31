import {resolveCuratedEmbed} from '../../../client/shared/embed/curatedEmbedProviders'
import type {EmbedMetadata} from '../../../client/shared/embed/embedTypes'
import {normalizeEmbedUrl} from '../../../client/shared/embed/normalizeEmbedUrl'
import {redisStaleWhileRevalidate} from '../redisStaleWhileRevalidate'
import {resolveOEmbed} from './oEmbedResolver'
import {resolveOpenGraph} from './openGraphResolver'

export const EMBED_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
export const EMBED_UNRESOLVED_CACHE_TTL_MS = 5 * 60 * 1000

const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** metascraper returns every key, nulled when it found nothing; those must not clobber oEmbed */
const definedOnly = <T extends object>(value: T | null): Partial<T> =>
  value ? (Object.fromEntries(Object.entries(value).filter(([, v]) => v != null)) as Partial<T>) : {}

/** True when a scrape produced no embedSrc and none of the real, provider-authored fields */
const hasRealMetadata = (metadata: Partial<EmbedMetadata>): boolean =>
  !!metadata.embedSrc ||
  !!metadata.title ||
  !!metadata.description ||
  !!metadata.thumbnailUrl ||
  !!metadata.faviconUrl ||
  !!metadata.authorName

/**
 * `isFallback` is decided here, at the point where we still know whether anything was
 * actually found, rather than reconstructed later from the shape of the metadata
 * (which cannot tell a synthesized hostname title apart from a page whose real title
 * happens to equal its hostname, or a scrape that came back with every metascraper
 * field nulled out - a login wall or soft-404 during an outage). Callers must treat a
 * fallback resolve as a failed lookup, not an authoritative "this field is gone".
 */
export type ResolveResult = {metadata: EmbedMetadata; isFallback: boolean}

const resolveUncached = async (url: string): Promise<ResolveResult> => {
  const base: EmbedMetadata = {url, fetchedAt: new Date().toISOString()}

  // Curated first: deterministic, no network, and it covers Google Docs, which the
  // oEmbed registry does not list at all.
  const curated = resolveCuratedEmbed(url)
  if (curated) {
    const enriched = await resolveOEmbed(url).catch(() => null)
    // A failed or empty enrichment leaves these fields unset rather than null: null
    // means the provider confirmed the field is gone, but a network error or timeout
    // here has told us nothing at all.
    return {
      metadata: {
        ...base,
        embedSrc: curated.embedSrc,
        providerName: curated.providerName,
        aspectRatio: curated.aspectRatio,
        ...definedOnly(enriched)
      },
      isFallback: false
    }
  }

  const oEmbed = await resolveOEmbed(url).catch(() => null)
  if (oEmbed?.embedSrc) {
    return {metadata: {...base, ...oEmbed}, isFallback: false}
  }

  const openGraph = await resolveOpenGraph(url).catch(() => null)
  // oEmbed may still have supplied a better title even when it gave us no iframe, so
  // only let Open Graph override the fields it actually found
  const scraped = {...definedOnly(oEmbed), ...definedOnly(openGraph)}
  if (hasRealMetadata(scraped)) {
    return {metadata: {...base, ...scraped, embedSrc: null}, isFallback: false}
  }

  return {
    metadata: {...base, embedSrc: null, title: hostnameOf(url), providerName: hostnameOf(url)},
    isFallback: true
  }
}

/**
 * Resolve a URL to embed metadata. Shared across every page that references the same
 * link, so a hundred pages embedding one video make one upstream call.
 */
export const resolveEmbed = async (
  rawUrl: string,
  refresh = false
): Promise<ResolveResult | null> => {
  const url = normalizeEmbedUrl(rawUrl)
  if (!url) return null
  // v2: the cached value changed shape from bare EmbedMetadata to {metadata, isFallback}.
  // Versioning the key avoids destructuring a pre-existing v1 entry as the new shape.
  return redisStaleWhileRevalidate(
    `embed:v2:${url}`,
    () => resolveUncached(url),
    (result) => (result.isFallback ? EMBED_UNRESOLVED_CACHE_TTL_MS : EMBED_CACHE_TTL_MS),
    {refresh}
  )
}
