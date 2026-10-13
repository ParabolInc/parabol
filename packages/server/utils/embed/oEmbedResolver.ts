import {extract, hasProvider, type OembedData} from '@extractus/oembed-extractor'
import {Response} from '@whatwg-node/fetch'
import type {EmbedAspectRatio, EmbedMetadata} from '../../../client/shared/embed/embedTypes'
import {fetchUntrusted} from '../fetchUntrusted'
import {Logger} from '../Logger'
import {extractIframeSrc} from './extractIframeSrc'

const MAX_OEMBED_BYTES = 256_000

// The registry endpoint is still a user-influenced URL, so it goes through the
// SSRF guard like everything else. oembed-extractor only needs a Response back.
const untrustedFetcher = async (url: string) => {
  const result = await fetchUntrusted(url, MAX_OEMBED_BYTES, {maxRedirects: 2})
  if (!result) throw new Error('oEmbed fetch blocked or failed')
  return new Response(new Uint8Array(result.buffer), {
    status: 200,
    headers: {'content-type': result.contentType}
  })
}

const toAspectRatio = (data: OembedData): EmbedAspectRatio | undefined => {
  const width = Number(data.width)
  const height = Number(data.height)
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return undefined
  }
  const ratio = width / height
  if (ratio >= 1.6) return '16:9'
  if (ratio >= 1.2) return '4:3'
  if (ratio >= 0.9) return '1:1'
  return 'tall'
}

export const resolveOEmbed = async (url: string): Promise<Partial<EmbedMetadata> | null> => {
  if (!hasProvider(url)) return null
  let data: OembedData
  try {
    data = await extract(url, undefined, untrustedFetcher)
  } catch (e) {
    Logger.debug(`oEmbed lookup failed for ${new URL(url).hostname}`, e)
    return null
  }
  const html = typeof data.html === 'string' ? data.html : undefined
  const embedSrc = extractIframeSrc(html)
  return {
    embedSrc,
    title: data.title ?? null,
    thumbnailUrl: data.thumbnail_url ?? null,
    providerName: data.provider_name ?? null,
    authorName: data.author_name ?? null,
    aspectRatio: toAspectRatio(data) ?? null
  }
}
