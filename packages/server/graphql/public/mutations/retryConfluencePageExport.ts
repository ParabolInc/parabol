import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {Logger} from '../../../utils/Logger'
import type {MutationResolvers} from '../resolverTypes'
import {runConfluenceExport} from './helpers/confluenceExport/runConfluenceExport'

const retryConfluencePageExport: MutationResolvers['retryConfluencePageExport'] = async (
  _source,
  {pageExportId, pageId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const [prefix, dbExportId] = pageExportId.split(':')
  if (prefix !== 'pageExport' || !dbExportId) {
    throw new GraphQLError('Invalid pageExportId')
  }
  const exportRow = await dataLoader.get('pageExports').load(dbExportId)
  if (!exportRow || exportRow.userId !== viewerId) {
    throw new GraphQLError('Export not found', {extensions: {code: 'NOT_FOUND'}})
  }
  // page access can be revoked after the original export — re-validate on every retry
  const access = await dataLoader
    .get('pageAccessByPageIdUserId')
    .load({pageId: exportRow.pageId, userId: viewerId})
  if (!access) {
    throw new GraphQLError('Export not found', {extensions: {code: 'NOT_FOUND'}})
  }
  const [dbPageId] = CipherId.fromClient(pageId)
  const pagesJson = exportRow.pagesJson
  const entry = pagesJson.find((page) => page.pageId === dbPageId)
  if (!entry || (entry.status !== 'error' && entry.status !== 'skipped')) {
    throw new GraphQLError('This page is not in a retryable state')
  }

  // re-seed the failed page plus its skipped descendants; the job reuses recorded parents
  const idsToRetry = new Set<number>([dbPageId])
  let changed = true
  while (changed) {
    changed = false
    for (const page of pagesJson) {
      if (
        page.parentPageId != null &&
        idsToRetry.has(page.parentPageId) &&
        !idsToRetry.has(page.pageId) &&
        page.status === 'skipped'
      ) {
        idsToRetry.add(page.pageId)
        changed = true
      }
    }
  }
  pagesJson.forEach((page) => {
    if (idsToRetry.has(page.pageId)) {
      page.status = 'pending'
      delete page.error
      delete page.errorClass
    }
  })

  await getKysely()
    .updateTable('PageExport')
    .set({
      status: 'running',
      pagesJson: JSON.stringify(pagesJson),
      updatedAt: sql`CURRENT_TIMESTAMP`
    })
    .where('id', '=', dbExportId)
    .execute()
  dataLoader.get('pageExports').clear(dbExportId)

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  analytics.confluenceExportStarted(viewer, {
    pageExportId: dbExportId,
    pageCount: idsToRetry.size,
    entryPoint: 'retry'
  })

  const jobDataLoader = getNewDataLoader('runConfluenceExport')
  runConfluenceExport(dbExportId, jobDataLoader)
    .catch(Logger.error)
    .finally(() => jobDataLoader.dispose())

  return {pageExportId: dbExportId}
}

export default retryConfluencePageExport
