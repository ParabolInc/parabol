import {TiptapTransformer} from '@hocuspocus/transformer'
import {GraphQLError} from 'graphql'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import * as Y from 'yjs'
import {getPageLinks} from '../../../client/shared/tiptap/getPageLinks'
import type AuthToken from '../../database/types/AuthToken'
import {getNewDataLoader} from '../../dataloader/getNewDataLoader'
import type {DataLoaderWorker} from '../../graphql/graphql'
import {publishToEmbedder} from '../../graphql/mutations/helpers/publishToEmbedder'
import type {DuplicatePlacement} from '../../graphql/public/mutations/helpers/getDuplicatePlacement'
import {hostUserAsset} from '../../graphql/public/mutations/helpers/hostUserAsset'
import {redisHocusPocus} from '../../hocusPocus'
import getKysely from '../../postgres/getKysely'
import {selectDescendantPages, selectPages} from '../../postgres/select'
import type {Page} from '../../postgres/types'
import {CipherId} from '../CipherId'
import {Logger} from '../Logger'
import {publishPageNotification} from '../publishPageNotification'
import {NEW_PAGE_SENTINEL_CODE} from './constants'
import {copyPageDoc} from './copyPageDoc'
import {createNewPage} from './createNewPage'
import {getEmptyPageDocState} from './getEmptyPageDocState'
import {getPageScopedAssetSrcs} from './getPageScopedAssetSrcs'
import {getPlaintextFromTipTap} from './getPlaintextFromTipTap'
import {publishSyncedBlockPlacementsChanged} from './hocusPocusHub'
import {updateBacklinks} from './updateBacklinks'

export const MAX_DUPLICATE_PAGES = 500
const MAX_IN_FLIGHT = 5

type SourcePage = {id: number; parentPageId: number | null; isDatabase: boolean}
type CopiedPageRow = Awaited<ReturnType<typeof createNewPage>>
type CopiedPage = {source: SourcePage; sourceState: Uint8Array; copyId: number}

interface Params {
  viewerId: string
  authToken: AuthToken
  dataLoader: DataLoaderWorker
  sourcePageId: number
  placement: DuplicatePlacement
  mutatorId?: string
  maxPages?: number
}

const mapInFlight = async <T, R>(items: readonly T[], fn: (item: T) => Promise<R>) => {
  const results: R[] = []
  let nextIdx = 0
  let hasFailed = false
  const worker = async () => {
    while (!hasFailed && nextIdx < items.length) {
      const idx = nextIdx++
      try {
        results[idx] = await fn(items[idx]!)
      } catch (e) {
        hasFailed = true
        throw e
      }
    }
  }
  const workers = Array.from({length: Math.min(MAX_IN_FLIGHT, items.length)}, worker)
  const rejected = (await Promise.allSettled(workers)).find((res) => res.status === 'rejected')
  if (rejected) throw rejected.reason
  return results
}

const selectLevelsToCopy = async (sourcePageId: number, viewerId: string) => {
  const rows = await selectDescendantPages(getKysely(), sourcePageId)
    .selectFrom('descendants')
    .innerJoin('Page', 'Page.id', 'descendants.id')
    .innerJoin('PageAccess', (join) =>
      join.onRef('PageAccess.pageId', '=', 'Page.id').on('PageAccess.userId', '=', viewerId)
    )
    .select([
      'Page.id',
      'Page.parentPageId',
      'Page.isDatabase',
      'Page.deletedAt',
      'Page.isSyncedBlock'
    ])
    .execute()
  const copyable = rows.filter(({deletedAt, isSyncedBlock}) => !deletedAt && !isSyncedBlock)
  const root = copyable.find(({id}) => id === sourcePageId)
  if (!root) throw new GraphQLError('Page not found', {extensions: {code: 'NOT_FOUND'}})
  const levels: SourcePage[][] = []
  const visitedIds = new Set<number>()
  let level: SourcePage[] = [root]
  while (level.length > 0) {
    levels.push(level)
    level.forEach(({id}) => visitedIds.add(id))
    const levelIds = new Set(level.map(({id}) => id))
    level = copyable.filter(
      ({id, parentPageId}) => parentPageId && levelIds.has(parentPageId) && !visitedIds.has(id)
    )
  }
  return levels
}

const readOpenPageState = async (pageId: number) => {
  const state = await redisHocusPocus.handleEvent(
    'readPageState',
    CipherId.toClient(pageId, 'page'),
    {},
    true
  )
  return state ? new Uint8Array(Buffer.from(state, 'base64')) : null
}

const readSourceStates = async (sourceIds: number[]) => {
  const openStates = await mapInFlight(sourceIds, readOpenPageState)
  const closedIds = sourceIds.filter((_id, idx) => !openStates[idx])
  const closedRows =
    closedIds.length > 0
      ? await getKysely()
          .selectFrom('Page')
          .select(['id', 'yDoc'])
          .where('id', 'in', closedIds)
          .execute()
      : []
  const savedStateById = new Map(closedRows.map(({id, yDoc}) => [id, yDoc]))
  return new Map(
    sourceIds.map((id, idx) => {
      const state = openStates[idx] ?? savedStateById.get(id) ?? getEmptyPageDocState()
      return [id, new Uint8Array(state)]
    })
  )
}

const toContent = (state: Uint8Array): TipTapSerializedPageContent => {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, state)
  return TiptapTransformer.fromYdoc(doc, 'default')
}

const getRootLocation = (placement: DuplicatePlacement) => {
  if (placement.kind === 'parent') return {parentPageId: placement.parentPageId}
  if (placement.kind === 'team') return {teamId: placement.teamId, sortOrder: placement.sortOrder}
  return {sortOrder: placement.sortOrder}
}

const rehostPageAssets = async (
  sourceState: Uint8Array,
  sourceId: number,
  copyId: number,
  authToken: AuthToken,
  dataLoader: DataLoaderWorker
) => {
  const assetSrcs = new Map<string, string>()
  const copyCode = String(CipherId.encrypt(copyId))
  for (const src of getPageScopedAssetSrcs(sourceState, CipherId.encrypt(sourceId))) {
    const hosted = await hostUserAsset(new URL(src), authToken, 'Page', copyCode, dataLoader)
    if ('url' in hosted && hosted.url) assetSrcs.set(src, hosted.url)
  }
  return assetSrcs
}

const writeBacklinks = async (copyId: number, state: Uint8Array) => {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, state)
  const syncedBlockIds: number[] = []
  const targetIds = getPageLinks(doc).flatMap((link) => {
    const pageCode = Number(link.getAttribute('pageCode'))
    if (!pageCode || pageCode === NEW_PAGE_SENTINEL_CODE) return []
    const targetId = CipherId.decrypt(pageCode)
    if (link.getAttribute('synced') === true) syncedBlockIds.push(targetId)
    return [targetId]
  })
  await Promise.all(targetIds.map((targetId) => updateBacklinks(copyId, targetId)))
  return syncedBlockIds
}

const removeCopies = async (copyIds: number[]) => {
  if (copyIds.length === 0) return
  await getKysely().deleteFrom('Page').where('id', 'in', copyIds).execute()
}

const announceCopies = async (copiedPages: CopiedPageRow[], mutatorId: string | undefined) => {
  const dataLoader = getNewDataLoader('duplicatePageTree')
  const subOptions = {mutatorId, operationId: dataLoader.share()}
  try {
    for (const page of copiedPages) {
      await publishPageNotification(
        page.id,
        'CreatePagePayload',
        {page},
        subOptions,
        dataLoader
      ).catch(Logger.log)
    }
  } finally {
    dataLoader.dispose()
  }
}

export const duplicatePageTree = async (params: Params): Promise<Page> => {
  const {viewerId, authToken, dataLoader, sourcePageId, placement, mutatorId} = params
  const maxPages = params.maxPages ?? MAX_DUPLICATE_PAGES
  const levels = await selectLevelsToCopy(sourcePageId, viewerId)
  const sources = levels.flat()
  if (sources.length > maxPages) {
    throw new GraphQLError(
      `This page has more than ${MAX_DUPLICATE_PAGES} pages inside it. Copy a smaller part of it.`,
      {extensions: {code: 'BAD_USER_INPUT'}}
    )
  }
  const stateBySourceId = await readSourceStates(sources.map(({id}) => id))
  const rootSource = sources[0]!
  const rootContent = toContent(stateBySourceId.get(rootSource.id)!)
  const rootTitle = `Copy of ${getPlaintextFromTipTap(rootContent).title || 'Untitled'}`

  const copiedPages: CopiedPageRow[] = []
  const placeCopies = async () => {
    const copyIdBySourceId = new Map<number, number>()
    const copies: CopiedPage[] = []
    for (const level of levels) {
      await mapInFlight(level, async (source) => {
        const sourceState = stateBySourceId.get(source.id)!
        const isRoot = source === rootSource
        const content = isRoot ? rootContent : toContent(sourceState)
        if (isRoot) {
          const heading = content.content.find((node) => node.type === 'heading')
          if (heading?.type === 'heading') heading.content = [{type: 'text', text: rootTitle}]
        }
        const location = isRoot
          ? getRootLocation(placement)
          : {parentPageId: copyIdBySourceId.get(source.parentPageId!)}
        const copiedPage = await createNewPage({
          userId: viewerId,
          content,
          yDoc: sourceState,
          isDatabase: source.isDatabase,
          isAnnounced: false,
          ...location
        })
        const copyId = copiedPage.id
        copiedPages.push(copiedPage)
        copyIdBySourceId.set(source.id, copyId)
        copies.push({source, sourceState, copyId})
      })
    }

    const childCodes = new Map(
      [...copyIdBySourceId].map(([sourceId, copyId]) => [
        CipherId.encrypt(sourceId),
        CipherId.encrypt(copyId)
      ])
    )
    const pg = getKysely()
    const copyStates = await mapInFlight(copies, async ({source, sourceState, copyId}) => {
      const assetSrcs = await rehostPageAssets(
        sourceState,
        source.id,
        copyId,
        authToken,
        dataLoader
      )
      const rootTitleRewrite = source === rootSource ? rootTitle : undefined
      const state = copyPageDoc(sourceState, {childCodes, assetSrcs, rootTitle: rootTitleRewrite})
      await pg
        .updateTable('Page')
        .set({yDoc: Buffer.from(state)})
        .where('id', '=', copyId)
        .execute()
      return {copyId, state}
    })
    const syncedBlockIds = await mapInFlight(copyStates, ({copyId, state}) =>
      writeBacklinks(copyId, state)
    )

    const rootCopyId = copyIdBySourceId.get(rootSource.id)!
    if (placement.kind === 'parent') {
      const {parentPageId, afterPageCode} = placement
      const documentName = CipherId.toClient(parentPageId, 'page')
      await redisHocusPocus
        .handleEvent('addCanonicalPageLink', documentName, {
          title: rootTitle,
          pageCode: CipherId.encrypt(rootCopyId),
          isDatabase: rootSource.isDatabase,
          isSyncedBlock: false,
          append: afterPageCode === null,
          afterPageCode: afterPageCode ?? undefined
        })
        .catch((e: unknown) => {
          if (!(e instanceof Error) || e.message !== 'TIMEOUT') throw e
          Logger.warn(`duplicatePageTree: placing the copy in ${documentName} timed out`)
        })
    }
    return {rootCopyId, syncedBlockIds: new Set(syncedBlockIds.flat())}
  }

  const placed = await placeCopies().catch(async (e: unknown) => {
    await removeCopies(copiedPages.map(({id}) => id)).catch(Logger.error)
    throw e
  })
  await announceCopies(copiedPages, mutatorId)
  placed.syncedBlockIds.forEach(publishSyncedBlockPlacementsChanged)
  copiedPages.forEach(({id: pageId}) => {
    publishToEmbedder({jobType: 'embedPage:start', pageId, userId: viewerId}).catch(Logger.log)
  })
  return selectPages().where('id', '=', placed.rootCopyId).executeTakeFirstOrThrow()
}
