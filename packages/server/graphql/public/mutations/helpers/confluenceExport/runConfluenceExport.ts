import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../../../postgres/getKysely'
import {selectPageExports} from '../../../../../postgres/select'
import AtlassianServerManager from '../../../../../utils/AtlassianServerManager'
import {analytics} from '../../../../../utils/analytics/analytics'
import {ConfluenceServerManager} from '../../../../../utils/ConfluenceServerManager'
import type {DegradedItem} from '../../../../../utils/confluence/types'
import publish from '../../../../../utils/publish'
import RedisLockQueue from '../../../../../utils/RedisLockQueue'
import type {DataLoaderWorker} from '../../../../graphql'
import {exportPageEntry} from './exportPageEntry'
import {resolveConfluenceAuth} from './resolveConfluenceAuth'

/**
 * The detached export job. Processes every pagesJson entry with status 'pending' in tree
 * order (parents first). One export per user runs at a time — the lock is user-scoped so
 * a user's exports serialize against their own OAuth rate budget without blocking anyone
 * else's.
 */
export const runConfluenceExport = async (pageExportId: string, dataLoader: DataLoaderWorker) => {
  const startedAt = Date.now()
  const pg = getKysely()
  // subscribers resolve published payloads with the dataloader registered under this
  // operationId — publishing without it leaves them a null dataLoader
  const operationId = dataLoader.share()
  const subOptions = {operationId}
  const exportRow = await selectPageExports()
    .where('id', '=', pageExportId)
    .executeTakeFirstOrThrow()
  const {userId, teamId, cloudId, spaceId, targetParentPageId} = exportRow
  const pagesJson = exportRow.pagesJson
  const degraded: DegradedItem[] = [...exportRow.degradedJson]
  let attachmentCount = 0

  // the ttl is the max HOLD time before the lock self-releases — it must exceed the
  // worst-case job duration (100 pages × create/upload with 429 retries)
  const redisLock = new RedisLockQueue(`confluenceExport:${userId}`, 1_800_000)
  await redisLock.lock(600_000)
  try {
    const persistAndPublish = async () => {
      await pg
        .updateTable('PageExport')
        .set({pagesJson: JSON.stringify(pagesJson), updatedAt: sql`CURRENT_TIMESTAMP`})
        .where('id', '=', pageExportId)
        .execute()
      dataLoader.get('pageExports').clear(pageExportId)
      publish(
        SubscriptionChannel.NOTIFICATION,
        userId,
        'ExportPagesToConfluenceSuccess',
        {pageExportId},
        subOptions
      )
    }

    const failAllPending = async (error: string) => {
      pagesJson.forEach((entry) => {
        if (entry.status === 'pending') {
          entry.status = 'error'
          entry.error = error
          entry.errorClass = 'unknown'
        }
      })
      await persistAndPublish()
    }

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

    const statuses = pagesJson.map(({status}) => status)
    const status = statuses.every((s) => s === 'success')
      ? 'success'
      : statuses.some((s) => s === 'success')
        ? 'partial'
        : 'failed'
    const rootEntry = pagesJson[0]
    await pg
      .updateTable('PageExport')
      .set({
        status,
        degradedJson: JSON.stringify(degraded),
        rootTargetPageId: rootEntry?.confluencePageId ?? null,
        rootTargetUrl: rootEntry?.targetUrl ?? null,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where('id', '=', pageExportId)
      .execute()
    dataLoader.get('pageExports').clear(pageExportId)
    publish(
      SubscriptionChannel.NOTIFICATION,
      userId,
      'ExportPagesToConfluenceSuccess',
      {pageExportId},
      subOptions
    )

    const viewer = await dataLoader.get('users').loadNonNull(userId)
    const properties = {
      pageExportId,
      pageCount: pagesJson.length,
      successCount: statuses.filter((s) => s === 'success').length,
      attachmentCount,
      durationMs: Date.now() - startedAt,
      status,
      degradedCensus: degraded.map(({blockType, count}) => `${blockType}:${count}`).join(',')
    }
    if (status === 'failed') {
      analytics.confluenceExportFailed(viewer, properties)
    } else {
      analytics.confluenceExportCompleted(viewer, properties)
    }
  } finally {
    await redisLock.unlock()
  }
}
