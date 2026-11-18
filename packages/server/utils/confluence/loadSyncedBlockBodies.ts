import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import type {PageLinkBlockAttrs} from 'parabol-client/shared/tiptap/extensions/PageLinkBlockBase'
import {getAllNodesAttributesByType} from 'parabol-client/shared/tiptap/getAllNodesAttributesByType'
import {getSyncedBlockBody} from 'parabol-client/shared/tiptap/getSyncedBlockBody'
import {MAX_SYNCED_BLOCK_DEPTH} from 'parabol-client/shared/tiptap/syncedBlockDepth'
import {applyUpdate, Doc} from 'yjs'
import {pageAccessByUserIdBatchFn} from '../../dataloader/pageAccessByUserIdBatchFn'
import getKysely from '../../postgres/getKysely'
import {CipherId} from '../CipherId'
import {selectUnsyncOutcomes} from '../tiptap/selectUnsyncOutcomes'
import {MAX_SYNCED_BLOCK_EXPANSIONS} from './types'

const getSyncedPageCodes = (content: JSONContent[]) =>
  getAllNodesAttributesByType<PageLinkBlockAttrs>({content}, 'pageLinkBlock')
    .filter(({synced}) => synced === true)
    .map(({pageCode}) => Number(pageCode))
    .filter(Number.isInteger)

const isVisibleToHostReaders = async (blockId: number, hostPageId: number) => {
  const outcome = (await selectUnsyncOutcomes(getKysely(), blockId, [hostPageId])).get(hostPageId)
  return !!outcome && outcome.hiddenReaderCount === 0 && !outcome.isPublicWithoutBlock
}

const loadBlockBodies = async (pageCodes: number[], hostPageId: number, viewerId: string) => {
  const pageIds = pageCodes.map((pageCode) => CipherId.decrypt(pageCode))
  const [pages, roles] = await Promise.all([
    getKysely()
      .selectFrom('Page')
      .select(['id', 'yDoc'])
      .where('id', 'in', pageIds)
      .where('isSyncedBlock', '=', true)
      .where('deletedAt', 'is', null)
      .execute(),
    pageAccessByUserIdBatchFn(pageIds.map((pageId) => ({pageId, userId: viewerId})))
  ])
  const yDocById = new Map(pages.map(({id, yDoc}) => [id, yDoc]))
  const loaded = await Promise.all(
    pageIds.map(async (pageId, index) => {
      const yDoc = yDocById.get(pageId)
      if (!yDoc || !roles[index] || !(await isVisibleToHostReaders(pageId, hostPageId))) return null
      const doc = new Doc()
      applyUpdate(doc, yDoc)
      const body = getSyncedBlockBody(TiptapTransformer.fromYdoc(doc, 'default') as JSONContent)
      return [pageCodes[index]!, body] as const
    })
  )
  return loaded.filter((entry) => entry !== null)
}

export const loadSyncedBlockBodies = async (
  doc: JSONContent,
  hostPageId: number,
  viewerId: string
): Promise<Map<number, JSONContent[]>> => {
  const bodies = new Map<number, JSONContent[]>()
  const seen = new Set<number>()
  let frontier = getSyncedPageCodes([doc])
  for (let depth = 0; depth < MAX_SYNCED_BLOCK_DEPTH; depth++) {
    const pageCodes = [...new Set(frontier)]
      .filter((pageCode) => !seen.has(pageCode))
      .slice(0, MAX_SYNCED_BLOCK_EXPANSIONS - seen.size)
    if (pageCodes.length === 0) break
    pageCodes.forEach((pageCode) => seen.add(pageCode))
    const loaded = await loadBlockBodies(pageCodes, hostPageId, viewerId)
    loaded.forEach(([pageCode, body]) => bodies.set(pageCode, body))
    frontier = getSyncedPageCodes(loaded.flatMap(([, body]) => body))
  }
  return bodies
}
