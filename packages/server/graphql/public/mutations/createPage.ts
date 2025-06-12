import {GraphQLError} from 'graphql'
import {positionBefore} from '../../../../client/shared/sortOrder'
import getKysely from '../../../postgres/getKysely'
import {analytics} from '../../../utils/analytics/analytics'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {MutationResolvers} from '../resolverTypes'
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
  const dbParentPageId = parentPageId ? CipherId.fromClient(parentPageId)[0] : undefined
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
  const topPage = await pg
    .selectFrom('Page')
    .select('sortOrder')
    .innerJoin('PageAccess', 'pageId', 'Page.id')
    .where('PageAccess.userId', '=', viewerId)
    .$if(!!teamId, (qb) => qb.where('teamId', '=', teamId!))
    .$if(!!dbParentPageId, (qb) => qb.where('parentPageId', '=', dbParentPageId!))
    .$if(!dbParentPageId, (qb) => qb.where('parentPageId', 'is', null))
    .$if(!teamId, (qb) => qb.where('isPrivate', '=', true))
    .orderBy('sortOrder')
    .limit(1)
    .executeTakeFirst()
  const sortOrder = positionBefore(topPage?.sortOrder ?? ' ')
  const page = await pg
    .insertInto('Page')
    .values({
      userId: viewerId,
      parentPageId: dbParentPageId,
      isPrivate: !(dbParentPageId || teamId),
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
  } else if (teamId) {
    await pg.insertInto('PageTeamAccess').values({teamId, pageId, role: 'editor'}).execute()
  }
  await viewerAccessPromise
  await pg
    .with('nextPageAccess', (qc) =>
      qc
        .selectFrom('PageUserAccess')
        .select(['userId', 'pageId', 'role'])
        .where('pageId', '=', pageId)
        .unionAll(({parens, selectFrom}) =>
          parens(
            selectFrom('PageTeamAccess')
              .innerJoin('TeamMember', 'PageTeamAccess.teamId', 'TeamMember.teamId')
              .where('pageId', '=', pageId)
              .where('TeamMember.isNotRemoved', '=', true)
              .select(['TeamMember.userId', 'pageId', 'role'])
          )
        )
        .unionAll(({parens, selectFrom}) =>
          parens(
            selectFrom('PageOrganizationAccess')
              .innerJoin(
                'OrganizationUser',
                'OrganizationUser.orgId',
                'PageOrganizationAccess.orgId'
              )
              .where('pageId', '=', pageId)
              .where('OrganizationUser.removedAt', 'is', null)
              .select(['OrganizationUser.userId', 'pageId', 'PageOrganizationAccess.role'])
          )
        )
    )
    .insertInto('PageAccess')
    .columns(['userId', 'pageId', 'role'])
    .expression((eb) => eb.selectFrom('nextPageAccess').select(['userId', 'pageId', 'role']))
    .execute()
  analytics.pageCreated(viewer, pageId)
  return {page}
}

export default createPage
