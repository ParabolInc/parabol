import {GraphQLError} from 'graphql'
import {applyUpdate, Doc, XmlElement} from 'yjs'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import getKysely from '../../../postgres/getKysely'
import {selectDescendantPages} from '../../../postgres/select'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {MAX_CONFLUENCE_EXPORT_PAGES} from '../../../utils/confluence/types'
import {hasConfluenceScopes} from '../../../utils/hasConfluenceScopes'
import {Logger} from '../../../utils/Logger'
import type {MutationResolvers} from '../resolverTypes'
import {isConfluenceExportEnabled} from './helpers/confluenceExport/isConfluenceExportEnabled'
import {loadPageExportTree} from './helpers/confluenceExport/loadPageExportTree'
import {runConfluenceExport} from './helpers/confluenceExport/runConfluenceExport'

const exportPagesToConfluence: MutationResolvers['exportPagesToConfluence'] = async (
  _source,
  {pageId, includeSubPages, cloudId, spaceId, spaceName, parentPageId, entryPoint},
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
  const auths = await dataLoader.get('atlassianAuthsByUserId').load(viewerId)
  const confluenceAuths = auths.filter(({scope}) => hasConfluenceScopes(scope))
  if (confluenceAuths.length === 0) {
    throw new GraphQLError('No Atlassian connection with Confluence access')
  }
  // the destination site must belong to one of the viewer's own Atlassian accounts.
  // stored cloudIds can lag (sites added after consent), so fall back to a live
  // accessible-resources check and self-heal the stored list on a match
  const seenAccountIds = new Set<string>()
  let siteAuth: (typeof confluenceAuths)[number] | null = null
  for (const auth of confluenceAuths) {
    if (seenAccountIds.has(auth.accountId)) continue
    seenAccountIds.add(auth.accountId)
    if (auth.cloudIds.includes(cloudId)) {
      siteAuth = auth
      break
    }
    const fresh = await dataLoader
      .get('freshAtlassianAuth')
      .load({teamId: auth.teamId, userId: viewerId})
    if (!fresh) continue
    const sites = await new AtlassianServerManager(fresh.accessToken).getAccessibleResources()
    if (Array.isArray(sites) && sites.some(({id}) => id === cloudId)) {
      await pg
        .updateTable('AtlassianAuth')
        .set({cloudIds: sites.map(({id}) => id)})
        .where('userId', '=', viewerId)
        .where('accountId', '=', auth.accountId)
        .where('isActive', '=', true)
        .execute()
      siteAuth = auth
      break
    }
  }
  if (!siteAuth) {
    throw new GraphQLError('Your Atlassian connection cannot access this Confluence site')
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
    const countRow = await selectDescendantPages(pg, dbPageId)
      .selectFrom('descendants')
      .select(({fn}) => fn.countAll().as('count'))
      .executeTakeFirstOrThrow()
    throw new GraphQLError(
      `This tree has ${Number(countRow.count)} pages — the limit is ${MAX_CONFLUENCE_EXPORT_PAGES}. Export a smaller branch.`
    )
  }

  const pageExport = await pg
    .insertInto('PageExport')
    .values({
      pageId: dbPageId,
      userId: viewerId,
      cloudId,
      spaceId,
      spaceName,
      parentPageId: parentPageId ?? null,
      includeSubPages,
      pagesJson: JSON.stringify(tree)
    })
    .returning('id')
    .executeTakeFirstOrThrow()

  const viewer = await dataLoader.get('users').loadNonNull(viewerId)
  analytics.confluenceExportStarted(viewer, {
    pageExportId: pageExport.id,
    pageCount: tree.length,
    entryPoint: entryPoint ?? undefined
  })

  const jobDataLoader = getNewDataLoader('runConfluenceExport')
  runConfluenceExport(pageExport.id, jobDataLoader)
    .catch(Logger.error)
    .finally(() => jobDataLoader.dispose())

  return {pageExportId: pageExport.id}
}

export default exportPagesToConfluence
