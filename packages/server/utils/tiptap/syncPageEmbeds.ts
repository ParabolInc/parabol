import * as Y from 'yjs'
import {type EmbedMetadata, PROVIDER_ATTR_KEYS} from '../../../client/shared/embed/embedTypes'
import {getLoomEmbedBlockAttrs} from '../../../client/shared/embed/getLoomEmbedBlockAttrs'
import {EMBED_CACHE_TTL_MS, resolveEmbed} from '../embed/resolveEmbed'
import {Logger} from '../Logger'

const RESOLVED_METADATA_KEYS = PROVIDER_ATTR_KEYS.filter((key) => key !== 'fetchedAt')

export const MAX_REVALIDATIONS_PER_LOAD = 10

const JITTER = 0.2

const BOOKKEEPING_ORIGIN = {source: 'local', skipStoreHooks: true} as const

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
  const fetchedAtMs = Date.parse(fetchedAt)
  if (!Number.isFinite(fetchedAtMs)) return true
  return now - fetchedAtMs > jitteredTTL(url)
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

const collectEmbedElements = (fragment: Y.XmlFragment) => {
  const embeds: Y.XmlElement[] = []
  const looms: Y.XmlElement[] = []
  const walker = fragment.createTreeWalker(
    (yxml) =>
      yxml instanceof Y.XmlElement && (yxml.nodeName === 'embedBlock' || yxml.nodeName === 'loom')
  )
  for (const node of walker) {
    const element = node as Y.XmlElement
    if (element.nodeName === 'loom') looms.push(element)
    else embeds.push(element)
  }
  return {embeds, looms}
}

const migrateLoomElements = (looms: Y.XmlElement[]) => {
  const fetchedAt = new Date().toISOString()
  for (const loom of looms) {
    const src = loom.getAttribute('src')
    const parent = loom.parent
    if (typeof src !== 'string' || !src) continue
    if (!(parent instanceof Y.XmlFragment || parent instanceof Y.XmlElement)) continue
    const index = parent.toArray().indexOf(loom)
    if (index === -1) continue
    const replacement = new Y.XmlElement('embedBlock')
    Object.entries({...getLoomEmbedBlockAttrs(src), fetchedAt}).forEach(([key, value]) => {
      replacement.setAttribute(key, value)
    })
    parent.delete(index, 1)
    parent.insert(index, [replacement])
  }
}

export const syncPageEmbeds = async (document: Y.Doc) => {
  const fragment = document.getXmlFragment('default')
  const {embeds, looms} = collectEmbedElements(fragment)
  if (looms.length > 0) {
    document.transact(() => migrateLoomElements(looms))
  }
  if (embeds.length === 0) return

  const now = Date.now()
  const stale = shuffle(
    embeds.filter((embed) => {
      const url = embed.getAttribute('url')
      return typeof url === 'string' && !!url && isStale(url, embed.getAttribute('fetchedAt'), now)
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
