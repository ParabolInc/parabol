import {type Connection, isTransactionOrigin} from '@hocuspocus/server'
import * as Y from 'yjs'
import appOrigin from '../../appOrigin'
import AuthToken from '../../database/types/AuthToken'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import {hostUserAsset} from '../../graphql/public/mutations/helpers/hostUserAsset'
import {validateScope} from '../../graphql/public/mutations/uploadUserAsset'
import {CipherId} from '../CipherId'
import logError from '../logError'
import {getUnsafeDeletedAttribute} from './getUnsafeDeletedAttribute'
import {getUserIdFromTransaction} from './getUserIdFromTransaction'
import {replacePageAssetSrc} from './hocusPocusHub'

const EMBEDDABLE_NODE_NAMES = new Set(['imageBlock', 'fileBlock'])
const MAX_CONCURRENT_PER_USER = 3

const isEmbeddable = (node: unknown): node is Y.XmlElement =>
  node instanceof Y.XmlElement && EMBEDDABLE_NODE_NAMES.has(node.nodeName)

const getChangedEmbeds = (e: Y.YEvent<any>) => {
  const embeds: Y.XmlElement[] = []
  e.changes.added.forEach((item) => {
    item.content.getContent().forEach((content) => {
      if (!(content instanceof Y.XmlElement)) return
      if (isEmbeddable(content)) embeds.push(content)
      for (const node of content.createTreeWalker(isEmbeddable)) {
        embeds.push(node as Y.XmlElement)
      }
    })
  })
  if (e instanceof Y.YXmlEvent && e.attributesChanged.has('src') && isEmbeddable(e.target)) {
    embeds.push(e.target)
  }
  return embeds
}

// A drag deletes a block and adds a copy in the same transaction. Moving an asset someone else added isn't adding it
const movedSrcsByTransaction = new WeakMap<Y.Transaction, Set<string>>()
const getMovedSrcs = (transaction: Y.Transaction) => {
  const cachedSrcs = movedSrcsByTransaction.get(transaction)
  if (cachedSrcs) return cachedSrcs
  const movedSrcs = new Set<string>()
  // deleted attributes are garbage collected after this transaction, so this must run synchronously in the observer
  Y.iterateDeletedStructs(transaction, transaction.deleteSet, (struct) => {
    if (!(struct instanceof Y.Item)) return
    const [node] = struct.content.getContent()
    if (!isEmbeddable(node)) return
    const src = getUnsafeDeletedAttribute(node, 'src', true)
    if (typeof src === 'string') movedSrcs.add(src)
  })
  movedSrcsByTransaction.set(transaction, movedSrcs)
  return movedSrcs
}

// Returns the URL to copy into this page's scope, or null when the src is already hosted here or can't be fetched
const getSourceUrl = (src: string, pageCode: number) => {
  let url: URL
  try {
    url = new URL(src, appOrigin)
  } catch {
    return null
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
  if (url.origin !== appOrigin) return url
  if (!url.pathname.startsWith('/assets/')) return null
  return url.pathname.startsWith(`/assets/Page/${pageCode}/`) ? null : url
}

const userQueues = new Map<string, {active: number; waiting: (() => void)[]}>()
const withUserLimit = async <T>(userId: string, fn: () => Promise<T>) => {
  const queue = userQueues.get(userId) ?? {active: 0, waiting: []}
  userQueues.set(userId, queue)
  if (queue.active >= MAX_CONCURRENT_PER_USER) {
    await new Promise<void>((resolve) => queue.waiting.push(resolve))
  }
  queue.active++
  try {
    return await fn()
  } finally {
    queue.active--
    const next = queue.waiting.shift()
    if (next) next()
    else if (queue.active === 0) userQueues.delete(userId)
  }
}

const hostAsUser = async (pageId: number, sourceUrl: URL, userId: string) => {
  const dataLoader = getNewDataLoader('rehostExternalAssets')
  try {
    const tms = await dataLoader.get('teamIdsByUserId').load(userId)
    const authToken = new AuthToken({sub: userId, tms})
    const pageKey = CipherId.toClient(pageId, 'page')
    const scopeCode = await validateScope(authToken, 'Page', pageKey, dataLoader)
    if (typeof scopeCode !== 'string') return scopeCode
    return await hostUserAsset(sourceUrl, authToken, 'Page', scopeCode, dataLoader)
  } finally {
    dataLoader.dispose()
  }
}

const inFlight = new Set<string>()
const rehostAsset = (
  pageId: number,
  src: string,
  sourceUrl: URL,
  userId: string,
  connection: Connection | undefined
) => {
  const key = `${pageId}:${userId}:${src}`
  if (inFlight.has(key)) return
  const rehost = async () => {
    try {
      const res = await withUserLimit(userId, () => hostAsUser(pageId, sourceUrl, userId))
      if ('url' in res) {
        await replacePageAssetSrc(pageId, src, res.url)
        return
      }
    } catch (error) {
      logError(error as Error, {userId, extras: {pageId}})
    } finally {
      inFlight.delete(key)
    }
    // the inserter's client shows its own copy until the hosted src arrives, so tell it when none will
    connection?.sendStateless(JSON.stringify({type: 'assetNotHosted', src}))
  }
  inFlight.add(key)
  rehost()
}

// Assets are copied into the page as whoever added them, so a URL planted in the doc never runs on a reader's
// access or quota. Anonymous public editors have no quota & never borrow anyone's, so their URLs stay external
export const rehostExternalAssets = (e: Y.YEvent<any>, pageId: number) => {
  const {transaction} = e
  const userId = getUserIdFromTransaction(transaction)
  if (!userId) return
  const {origin} = transaction
  const connection =
    isTransactionOrigin(origin) && origin.source === 'connection' ? origin.connection : undefined
  const embeds = getChangedEmbeds(e)
  if (embeds.length === 0) return
  const pageCode = CipherId.encrypt(pageId)
  const movedSrcs = getMovedSrcs(transaction)
  embeds.forEach((node) => {
    const src = node.getAttribute('src')
    if (typeof src !== 'string' || movedSrcs.has(src)) return
    const sourceUrl = getSourceUrl(src, pageCode)
    if (!sourceUrl) return
    rehostAsset(pageId, src, sourceUrl, userId, connection)
  })
}
