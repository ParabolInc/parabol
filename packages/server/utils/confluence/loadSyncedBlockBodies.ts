import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {getSyncedBlockBody} from 'parabol-client/shared/tiptap/getSyncedBlockBody'
import {MAX_SYNCED_BLOCK_DEPTH} from 'parabol-client/shared/tiptap/syncedBlockDepth'
import {applyUpdate, Doc} from 'yjs'
import {pageAccessByUserIdBatchFn} from '../../dataloader/pageAccessByUserIdBatchFn'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {selectUnsyncOutcomes} from '../tiptap/selectUnsyncOutcomes'

const collectSyncedPageCodes = (node: JSONContent, codes: Set<number>) => {
  if (node.type === 'pageLinkBlock' && node.attrs?.synced === true) {
    const pageCode = Number(node.attrs.pageCode)
    if (Number.isInteger(pageCode)) codes.add(pageCode)
  }
  node.content?.forEach((child) => {
    collectSyncedPageCodes(child, codes)
  })
}

const loadBlockBody = async (pageCode: number, hostPageId: number, viewerId: string) => {
  const pageId = CipherId.decrypt(pageCode)
  const page = await getKysely()
    .selectFrom('Page')
    .select(['yDoc', 'isSyncedBlock', 'deletedAt'])
    .where('id', '=', pageId)
    .executeTakeFirst()
  if (!page?.isSyncedBlock || page.deletedAt || !page.yDoc) return null
  const [role] = await pageAccessByUserIdBatchFn([{pageId, userId: viewerId}])
  if (!role) return null
  const outcome = (await selectUnsyncOutcomes(getKysely(), pageId, [hostPageId])).get(hostPageId)
  if (!outcome || outcome.hiddenReaderCount > 0 || outcome.isPublicWithoutBlock) return null
  const yDoc = new Doc()
  applyUpdate(yDoc, page.yDoc)
  return getSyncedBlockBody(TiptapTransformer.fromYdoc(yDoc, 'default') as JSONContent)
}

export const loadSyncedBlockBodies = async (
  doc: JSONContent,
  hostPageId: number,
  viewerId: string
): Promise<Map<number, JSONContent[]>> => {
  const bodies = new Map<number, JSONContent[]>()
  const seen = new Set<number>()
  let frontier = new Set<number>()
  collectSyncedPageCodes(doc, frontier)
  for (let depth = 0; depth < MAX_SYNCED_BLOCK_DEPTH && frontier.size > 0; depth++) {
    const codes = [...frontier].filter((code) => !seen.has(code))
    codes.forEach((code) => {
      seen.add(code)
    })
    const loaded = await Promise.all(
      codes.map(async (code) => [code, await loadBlockBody(code, hostPageId, viewerId)] as const)
    )
    frontier = new Set()
    for (const [code, body] of loaded) {
      if (!body) continue
      bodies.set(code, body)
      body.forEach((node) => {
        collectSyncedPageCodes(node, frontier)
      })
    }
  }
  return bodies
}
