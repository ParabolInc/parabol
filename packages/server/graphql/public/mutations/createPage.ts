import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {__END__} from '../../../../client/shared/sortOrder'
import getKysely from '../../../postgres/getKysely'
import {updatePageAccessTable} from '../../../postgres/updatePageAccessTable'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {hocusPocusHub} from '../../../utils/tiptap/hocusPocusHub'
import {MutationResolvers} from '../resolverTypes'
import {getPageNextSortOrder} from './helpers/getPageNextSortOrder'
import {MAX_PAGE_DEPTH} from './updatePage'

const createPage: MutationResolvers['createPage'] = async (
  _source,
  {parentPageId, teamId},
  {authToken, dataLoader}
) => {
  if (parentPageId && teamId) {
    throw new GraphQLError('Can only provider either parentPageId OR teamId')
  }
  const viewerId = getUserId(authToken)
  const dbParentPageId = parentPageId ? CipherId.fromClient(parentPageId)[0] : null
  const [viewer, parentPage] = await Promise.all([
    dataLoader.get('users').loadNonNull(viewerId),
    dbParentPageId ? dataLoader.get('pages').load(dbParentPageId) : null
  ])
  if (dbParentPageId && !parentPage) {
    throw new GraphQLError('Invalid parentPageId')
  }

  if (parentPage && parentPage.ancestorIds.length >= MAX_PAGE_DEPTH) {
    throw new GraphQLError(`Pages can only be nested ${MAX_PAGE_DEPTH} pages deep`, {
      extensions: {code: 'MAX_PAGE_DEPTH_REACHED'}
    })
  }

  const pg = getKysely()
  const isPrivate = teamId ? false : parentPage ? parentPage.isPrivate : true
  const sortOrder = await getPageNextSortOrder(
    __END__,
    viewerId,
    isPrivate,
    teamId || null,
    dbParentPageId
  )
  const page = await pg
    .insertInto('Page')
    .values({
      userId: viewerId,
      parentPageId: dbParentPageId,
      isPrivate,
      ancestorIds: parentPage?.ancestorIds.concat(dbParentPageId!) ?? [],
      teamId,
      sortOrder
    })
    .returningAll()
    .executeTakeFirstOrThrow()
  const {id: pageId} = page
  const viewerAccessPromise = pg
    .insertInto('PageUserAccess')
    .values({userId: viewerId, pageId, role: 'owner'})
    .execute()
  if (dbParentPageId) {
    await Promise.all([
      pg
        .insertInto('PageUserAccess')
        .columns(['userId', 'pageId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('PageUserAccess')
            .select((eb) => ['userId', eb.val(pageId).as('pageId'), 'role'])
            .where('pageId', '=', dbParentPageId)
            .where('userId', '!=', viewerId)
        )
        .execute(),
      pg
        .insertInto('PageTeamAccess')
        .columns(['teamId', 'pageId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('PageTeamAccess')
            .select((eb) => ['teamId', eb.val(pageId).as('pageId'), 'role'])
            .where('pageId', '=', dbParentPageId)
        )
        .execute(),
      pg
        .insertInto('PageOrganizationAccess')
        .columns(['orgId', 'pageId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('PageOrganizationAccess')
            .select((eb) => ['orgId', eb.val(pageId).as('pageId'), 'role'])
            .where('pageId', '=', dbParentPageId)
        )
        .execute(),
      pg
        .insertInto('PageExternalAccess')
        .columns(['email', 'pageId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('PageExternalAccess')
            .select((eb) => ['email', eb.val(pageId).as('pageId'), 'role'])
            .where('pageId', '=', dbParentPageId)
        )
        .execute()
    ])
    // Add the Auto-toc PageLinkBlock to the parent
    hocusPocusHub.emit('insertChildPageLink', dbParentPageId, pageId)
  } else if (teamId) {
    await pg.insertInto('PageTeamAccess').values({teamId, pageId, role: 'editor'}).execute()
  }
  await viewerAccessPromise
  await updatePageAccessTable(pg, pageId, {skipDeleteOld: true})
    .selectNoFrom(sql`1`.as('t'))
    .execute()
  analytics.pageCreated(viewer, pageId)
  return {page}
}

export default createPage
