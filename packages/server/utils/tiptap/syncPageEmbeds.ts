import * as Y from 'yjs'
import {type EmbedMetadata, PROVIDER_ATTR_KEYS} from '../../../client/shared/embed/embedTypes'
import {EMBED_CACHE_TTL_MS, resolveEmbed} from '../embed/resolveEmbed'
import {Logger} from '../Logger'

const RESOLVED_METADATA_KEYS = PROVIDER_ATTR_KEYS.filter((key) => key !== 'fetchedAt')

export const MAX_REVALIDATIONS_PER_LOAD = 10

const BOOKKEEPING_ORIGIN = {source: 'local', skipStoreHooks: true} as const

const isStale = (fetchedAt: unknown, now: number) => {
  if (typeof fetchedAt !== 'string') return true
  const fetchedAtMs = Date.parse(fetchedAt)
  if (!Number.isFinite(fetchedAtMs)) return true
  return now - fetchedAtMs > EMBED_CACHE_TTL_MS
}

const shuffle = <T>(items: T[]) => {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!]
  }
  return shuffled
}

// undefined means the provider said nothing, so keep the prior value; null means it reports the field gone
const getMetadataChanges = (embed: Y.XmlElement, metadata: EmbedMetadata) => {
  const changes: {key: (typeof RESOLVED_METADATA_KEYS)[number]; value: string | null}[] = []
  for (const key of RESOLVED_METADATA_KEYS) {
    const value = metadata[key]
    if (value === undefined || embed.getAttribute(key) === (value ?? undefined)) continue
    changes.push({key, value})
  }
  return changes
}

const collectEmbedElements = (fragment: Y.XmlFragment) =>
  Array.from(
    fragment.createTreeWalker(
      (yxml) => yxml instanceof Y.XmlElement && yxml.nodeName === 'embedBlock'
    )
  ) as Y.XmlElement[]

export const syncPageEmbeds = async (document: Y.Doc) => {
  const fragment = document.getXmlFragment('default')
  const embeds = collectEmbedElements(fragment)
  if (embeds.length === 0) return

  const now = Date.now()
  const stale = shuffle(
    embeds.filter((embed) => {
      const url = embed.getAttribute('url')
      return typeof url === 'string' && !!url && isStale(embed.getAttribute('fetchedAt'), now)
    })
  ).slice(0, MAX_REVALIDATIONS_PER_LOAD)
  if (stale.length === 0) return

  const results = await Promise.all(
    stale.map(async (embed) => {
      const url = embed.getAttribute('url') as string
      try {
        return {embed, url, result: await resolveEmbed(url)}
      } catch (e) {
        Logger.debug(`embed revalidation failed for ${url}`, e)
        return {embed, url, result: null}
      }
    })
  )

  // When we last reconciled the node, not the cache's fetchedAt: a cache hit would otherwise stay stale forever
  const fetchedAt = new Date().toISOString()
  const refreshed = results.flatMap(({embed, url, result}) => {
    // A fallback found nothing authoritative (login wall, soft-404, outage), so keep the last good snapshot
    if (!result || result.isFallback) return []
    if (embed.getAttribute('url') !== url) return []
    return [{embed, changes: getMetadataChanges(embed, result.metadata)}]
  })
  const changed = refreshed.filter(({changes}) => changes.length > 0)
  const unchanged = refreshed.filter(({changes}) => changes.length === 0)

  if (changed.length > 0) {
    document.transact(() => {
      changed.forEach(({embed, changes}) => {
        changes.forEach(({key, value}) => {
          if (value === null) embed.removeAttribute(key)
          else embed.setAttribute(key, value)
        })
        embed.setAttribute('fetchedAt', fetchedAt)
      })
    })
  }
  if (unchanged.length > 0) {
    document.transact(() => {
      unchanged.forEach(({embed}) => embed.setAttribute('fetchedAt', fetchedAt))
    }, BOOKKEEPING_ORIGIN)
  }
}
