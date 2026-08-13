import {selectPageExports} from '../../../../../postgres/select'
import AtlassianServerManager from '../../../../../utils/AtlassianServerManager'
import {ConfluenceServerManager} from '../../../../../utils/ConfluenceServerManager'
import type {DegradedItem} from '../../../../../utils/confluence/types'
import {Logger} from '../../../../../utils/Logger'
import RedisLockQueue from '../../../../../utils/RedisLockQueue'
import type {DataLoaderWorker} from '../../../../graphql'
import {exportPageEntry} from './exportPageEntry'
import {createPageExportPersistence} from './pageExportPersistence'
import {resolveConfluenceAuth} from './resolveConfluenceAuth'

/**
 * The detached export job. Processes every pagesJson entry with status 'pending' in tree
 * order (parents first). One export per user runs at a time — the lock is user-scoped so
 * a user's exports serialize against their own OAuth rate budget without blocking anyone
 * else's. Every exit path (including lock timeout and unexpected throws) finalizes the
 * PageExport row — a row must never be left at status 'running' with no live job.
 */
export const runConfluenceExport = async (pageExportId: string, dataLoader: DataLoaderWorker) => {
  const startedAt = Date.now()
  // subscribers resolve published payloads with the dataloader registered under this
  // operationId — publishing without it leaves them a null dataLoader
  const operationId = dataLoader.share()
  const exportRow = await selectPageExports()
    .where('id', '=', pageExportId)
    .executeTakeFirstOrThrow()
  const {userId, teamId, cloudId, spaceId, targetParentPageId} = exportRow
  const pagesJson = exportRow.pagesJson
  const degraded: DegradedItem[] = [...exportRow.degradedJson]
  let attachmentCount = 0

  const {persistAndPublish, failAllPending, finalize} = createPageExportPersistence({
    pageExportId,
    userId,
    pagesJson,
    degraded,
    dataLoader,
    operationId,
    startedAt
  })

  // the ttl is the max HOLD time before the lock self-releases — it must exceed the
  // worst-case job duration (100 pages × create/upload with 429 retries)
  const redisLock = new RedisLockQueue(`confluenceExport:${userId}`, 1_800_000)
  try {
    await redisLock.lock(600_000)
  } catch (e) {
    Logger.error(e)
    await failAllPending('Another export is already running for your account. Try again shortly.')
    await finalize(attachmentCount)
    return
  }
  try {
    const {auth, error: authError} = await resolveConfluenceAuth(
      dataLoader,
      userId,
      teamId,
      cloudId
    )
    if (!auth) {
      await failAllPending(authError)
    } else {
      const atlassianManager = new AtlassianServerManager(auth.accessToken)
      const sites = await atlassianManager.getAccessibleResources()
      const siteUrl = Array.isArray(sites) ? sites.find(({id}) => id === cloudId)?.url : undefined
      const confluence = new ConfluenceServerManager(auth.accessToken, cloudId)

      const confluenceIdByPageId = new Map<number, string>()
      pagesJson.forEach(({pageId, confluencePageId}) => {
        if (confluencePageId) confluenceIdByPageId.set(pageId, confluencePageId)
      })

      for (const entry of pagesJson) {
        if (entry.status !== 'pending') continue
        const parentEntry =
          entry.parentPageId == null
            ? null
            : pagesJson.find(({pageId}) => pageId === entry.parentPageId)
        if (parentEntry && parentEntry.status !== 'success') {
          entry.status = 'skipped'
          entry.error = 'skipped (parent failed)'
          await persistAndPublish()
          continue
        }
        entry.status = 'exporting'
        await persistAndPublish()

        const parentConfluenceId =
          entry.parentPageId == null
            ? (targetParentPageId ?? undefined)
            : confluenceIdByPageId.get(entry.parentPageId)
        const result = await exportPageEntry({
          entry,
          pagesJson,
          parentConfluenceId,
          confluence,
          spaceId,
          siteUrl,
          userId,
          pageExportId
        })
        if (result.status === 'success') {
          confluenceIdByPageId.set(entry.pageId, result.confluencePageId)
          entry.confluencePageId = result.confluencePageId
          entry.targetUrl = result.targetUrl
          entry.title = result.finalTitle
          entry.status = 'success'
          degraded.push(...result.degraded)
          attachmentCount += result.attachmentCount
        } else {
          entry.status = 'error'
          entry.error = result.error
          entry.errorClass = result.errorClass
        }
        await persistAndPublish()
      }
    }
    await finalize(attachmentCount)
  } catch (e) {
    Logger.error(e)
    await failAllPending(e instanceof Error ? e.message : 'Export failed')
    await finalize(attachmentCount)
  } finally {
    await redisLock.unlock()
  }
}
