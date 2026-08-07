import {GraphQLError} from 'graphql'
import {applyUpdate, Doc, XmlElement} from 'yjs'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {MAX_CONFLUENCE_EXPORT_PAGES} from '../../../utils/confluence/types'
import {Logger} from '../../../utils/Logger'
import type {MutationResolvers} from '../resolverTypes'
import {isConfluenceExportEnabled} from './helpers/confluenceExport/isConfluenceExportEnabled'
import {loadPageExportTree} from './helpers/confluenceExport/loadPageExportTree'
import {resolveConfluenceAuth} from './helpers/confluenceExport/resolveConfluenceAuth'
import {runConfluenceExport} from './helpers/confluenceExport/runConfluenceExport'

const exportPagesToConfluence: MutationResolvers['exportPagesToConfluence'] = async (
  _source,
  {pageId, teamId, includeSubPages, cloudId, spaceId, spaceName, targetParentPageId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()

  if (!(await isConfluenceExportEnabled(viewerId, dataLoader))) {
    throw new GraphQLError('Confluence export is not enabled for your organization')
  }
  const [dbPageId] = CipherId.fromClient(pageId)
  const page = await dataLoader.get('pages').load(dbPageId)
  if (!page) {
    throw new GraphQLError('Page not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (page.deletedAt) {
    throw new GraphQLError('Cannot export a page in the trash')
  }
  const {auth, error: authError} = await resolveConfluenceAuth(
    dataLoader,
    viewerId,
    teamId,
    cloudId
  )
  if (!auth) {
    throw new GraphQLError(authError)
  }

  const rootRow = await pg
    .selectFrom('Page')
    .select('yDoc')
    .where('id', '=', dbPageId)
    .executeTakeFirst()
  if (rootRow?.yDoc) {
    const doc = new Doc()
    applyUpdate(doc, rootRow.yDoc)
    const isGenerating = doc
      .getXmlFragment('default')
      .toArray()
      .some((node) => node instanceof XmlElement && node.nodeName === 'thinkingBlock')
    if (isGenerating) {
      throw new GraphQLError('This page is still generating. Try again when the summary finishes.')
    }
  }

  const tree = await loadPageExportTree(dbPageId, includeSubPages, viewerId)
  if (tree.length === 0) {
    throw new GraphQLError('Page not found', {extensions: {code: 'NOT_FOUND'}})
  }
  if (tree.length > MAX_CONFLUENCE_EXPORT_PAGES) {
    throw new GraphQLError(
      `This tree has more than ${MAX_CONFLUENCE_EXPORT_PAGES} linked pages. Export a smaller branch.`
    )
  }

  const pageExport = await pg
    .insertInto('PageExport')
    .values({
      pageId: dbPageId,
      userId: viewerId,
      teamId,
      cloudId,
      spaceId,
      spaceName,
      targetParentPageId: targetParentPageId ?? null,
      includeSubPages,
      pagesJson: JSON.stringify(tree)
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  analytics.confluenceExportStarted(viewer, {
    pageExportId: pageExport.id,
    pageCount: tree.length
  })

  const jobDataLoader = getNewDataLoader('runConfluenceExport')
  runConfluenceExport(pageExport.id, jobDataLoader)
    .catch(Logger.error)
    .finally(() => jobDataLoader.dispose())

  return {pageExportId: pageExport.id}
}

export default exportPagesToConfluence
