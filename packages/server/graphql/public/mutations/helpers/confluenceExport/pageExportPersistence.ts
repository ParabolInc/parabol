import {sql} from 'kysely'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../../../postgres/getKysely'
import {analytics} from '../../../../../utils/analytics/analytics'
import type {DegradedItem, PageExportPageState} from '../../../../../utils/confluence/types'
import publish from '../../../../../utils/publish'
import type {DataLoaderWorker} from '../../../../graphql'

/**
 * Owns every write to the PageExport row and every progress publish for one export run.
 * The orchestrator only mutates the in-memory pagesJson/degraded state and calls these.
 */
export const createPageExportPersistence = (input: {
  pageExportId: string
  userId: string
  pagesJson: PageExportPageState[]
  degraded: DegradedItem[]
  dataLoader: DataLoaderWorker
  operationId: string
  startedAt: number
}) => {
  const {pageExportId, userId, pagesJson, degraded, dataLoader, operationId, startedAt} = input
  const pg = getKysely()
  const subOptions = {operationId}

  const publishProgress = () => {
    dataLoader.get('pageExports').clear(pageExportId)
    publish(
      SubscriptionChannel.NOTIFICATION,
      userId,
      'ExportPagesToConfluenceSuccess',
      {pageExportId},
      subOptions
    )
  }

  const persistAndPublish = async () => {
    await pg
      .updateTable('PageExport')
      .set({pagesJson: JSON.stringify(pagesJson), updatedAt: sql`CURRENT_TIMESTAMP`})
      .where('id', '=', pageExportId)
      .execute()
    publishProgress()
  }

  const failAllPending = async (error: string) => {
    pagesJson.forEach((entry) => {
      if (entry.status === 'pending' || entry.status === 'exporting') {
        entry.status = 'error'
        entry.error = error
        entry.errorClass = 'unknown'
      }
    })
    await persistAndPublish()
  }

  const finalize = async (attachmentCount: number) => {
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
        pagesJson: JSON.stringify(pagesJson),
        degradedJson: JSON.stringify(degraded),
        rootTargetPageId: rootEntry?.confluencePageId ?? null,
        rootTargetUrl: rootEntry?.targetUrl ?? null,
        updatedAt: sql`CURRENT_TIMESTAMP`
      })
      .where('id', '=', pageExportId)
      .execute()
    publishProgress()

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
  }

  return {persistAndPublish, failAllPending, finalize}
}
