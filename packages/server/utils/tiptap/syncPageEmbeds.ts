import * as Y from 'yjs'
import {resolveCuratedEmbed} from '../../../client/shared/embed/curatedEmbedProviders'
import {type EmbedMetadata, PROVIDER_ATTR_KEYS} from '../../../client/shared/embed/embedTypes'
import {EMBED_CACHE_TTL_MS, resolveEmbed} from '../embed/resolveEmbed'
import {Logger} from '../Logger'

const RESOLVED_METADATA_KEYS = PROVIDER_ATTR_KEYS.filter((key) => key !== 'fetchedAt')

/**
 * Bounded work per document load. A page with 200 embeds refreshes 10 now and 10 on
 * the next open rather than making 200 upstream calls at once.
 */
export const MAX_REVALIDATIONS_PER_LOAD = 10

const JITTER = 0.2

/**
 * Deterministic per-URL jitter so embeds pasted in one sitting do not all fall due in
 * the same second. Hashing the URL keeps it stable across loads, unlike Math.random.
 */
const jitteredTTL = (url: string) => {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i)
    hash |= 0
  }
  const unit = (Math.abs(hash) % 1000) / 1000
  return EMBED_CACHE_TTL_MS * (1 + (unit * 2 - 1) * JITTER)
}

const isStale = (url: string, fetchedAt: unknown, now: number) => {
  if (typeof fetchedAt !== 'string') return true
  const at = Date.parse(fetchedAt)
  if (!Number.isFinite(at)) return true
  return now - at > jitteredTTL(url)
}

/**
 * Provider-derived attributes only. Revalidation must never touch url, displayMode,
 * align, width, isFullWidth, or aspectRatio, so a background write cannot fight a
 * reader's formatting choice.
 *
 * A field left `undefined` in the resolved metadata means the provider said nothing
 * about it, so the prior value is preserved. A field explicitly `null` means the
 * provider actively reports it gone (framing disallowed, source deleted), so a
 * successful resolve clears it rather than leaving a dead value behind.
 */
const applyMetadata = (el: Y.XmlElement, metadata: EmbedMetadata) => {
  for (const key of RESOLVED_METADATA_KEYS) {
    const value = metadata[key]
    if (value === undefined) continue
    if (value === null) {
      el.removeAttribute(key)
      continue
    }
    if (el.getAttribute(key) !== value) {
      el.setAttribute(key, value)
    }
  }
  // Always now, never metadata.fetchedAt. These are two different clocks: this one
  // records when we last reconciled the node, while the Redis TTL governs upstream
  // freshness. Writing the cached timestamp back would leave the node permanently
  // stale and re-resolving on every single load.
  el.setAttribute('fetchedAt', new Date().toISOString())
}

const collectEmbedElements = (frag: Y.XmlFragment) => {
  const embeds: Y.XmlElement[] = []
  const looms: Y.XmlElement[] = []
  const walker = frag.createTreeWalker(
    (yxml) =>
      yxml instanceof Y.XmlElement && (yxml.nodeName === 'embedBlock' || yxml.nodeName === 'loom')
  )
  for (const node of walker) {
    const el = node as Y.XmlElement
    if (el.nodeName === 'loom') looms.push(el)
    else embeds.push(el)
  }
  return {embeds, looms}
}

/**
 * Rewrite legacy `loom` nodes in place. Yjs stores element names directly, so a stored
 * loom node needs either a schema entry or an upgrade; this is the lazy migration,
 * running on the single server that owns the document.
 */
const migrateLoomElements = (frag: Y.XmlFragment, looms: Y.XmlElement[]) => {
  for (const loom of looms) {
    const src = loom.getAttribute('src')
    if (typeof src !== 'string' || !src) continue
    const curated = resolveCuratedEmbed(src)
    const parent = loom.parent as Y.XmlFragment | Y.XmlElement | null
    if (!parent) continue
    const index = (parent as Y.XmlFragment).toArray().findIndex((child) => child === loom)
    if (index === -1) continue
    const replacement = new Y.XmlElement('embedBlock')
    replacement.setAttribute('url', src)
    replacement.setAttribute('displayMode', 'embed')
    replacement.setAttribute('align', 'center')
    replacement.setAttribute('aspectRatio', curated?.aspectRatio ?? '16:9')
    if (curated) {
      replacement.setAttribute('embedSrc', curated.embedSrc)
      replacement.setAttribute('providerName', curated.providerName)
    }
    ;(parent as Y.XmlFragment).delete(index, 1)
    ;(parent as Y.XmlFragment).insert(index, [replacement])
  }
  return frag
}

/**
 * Pull-side reconciliation for embed metadata. Embeds cannot be push-invalidated (no
 * provider webhooks us when a title changes), so without this they would go stale and
 * never resync. Runs in afterLoadDocument, on the one server that owns the document.
 */
export const syncPageEmbeds = async (document: Y.Doc) => {
  const frag = document.getXmlFragment('default')
  const {embeds, looms} = collectEmbedElements(frag)
  if (looms.length > 0) {
    document.transact(() => migrateLoomElements(frag, looms))
  }
  if (embeds.length === 0) return

  const now = Date.now()
  const stale = embeds
    .filter((el) => {
      const url = el.getAttribute('url')
      return typeof url === 'string' && !!url && isStale(url, el.getAttribute('fetchedAt'), now)
    })
    .slice(0, MAX_REVALIDATIONS_PER_LOAD)
  if (stale.length === 0) return

  const results = await Promise.all(
    stale.map(async (el) => {
      const url = el.getAttribute('url') as string
      try {
        return {el, result: await resolveEmbed(url)}
      } catch (e) {
        Logger.debug(`embed revalidation failed for ${url}`, e)
        return {el, result: null}
      }
    })
  )

  document.transact(() => {
    for (const {el, result} of results) {
      // A thrown resolve, or a fallback resolve (nothing was actually found - a login
      // wall, a soft-404, an outage), keeps the last known good snapshot untouched.
      // Only an authoritative successful resolve may clear a field.
      if (!result || result.isFallback) continue
      applyMetadata(el, result.metadata)
    }
  })
}
