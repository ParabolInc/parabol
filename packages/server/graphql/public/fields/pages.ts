import {GraphQLError} from 'graphql'
import {type Expression, type ExpressionBuilder, type NotNull, type SqlBool, sql} from 'kysely'
import {positionBefore} from '../../../../client/shared/sortOrder'
import getKysely from '../../../postgres/getKysely'
import {selectPages} from '../../../postgres/select'
import type {DB} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {ResourceGrants} from '../ResourceGrants'
import type {UserResolvers} from '../resolverTypes'

type PageGrantCriteria = NonNullable<ReturnType<ResourceGrants['getPageGrantCriteria']>>

const buildGrantFilter = (
  eb: ExpressionBuilder<DB, any>,
  pageIdRef: string,
  criteria: PageGrantCriteria
): Expression<SqlBool> => {
  const {pageIds, teamIds, orgIds} = criteria
  const conditions: Expression<SqlBool>[] = []
  const ref = sql.ref(pageIdRef)

  if (pageIds !== null && pageIds.size > 0) {
    conditions.push(eb(ref, 'in', [...pageIds]))
  }

  if (orgIds !== null && orgIds.length > 0) {
    conditions.push(
      eb.exists(
        eb
          .selectFrom('PageOrganizationAccess')
          .select(sql.lit(1).as('one'))
          .whereRef('pageId', '=', ref)
          .where('orgId', 'in', orgIds)
      )
    )
  }

  if (teamIds !== null && orgIds !== null && teamIds.length > 0) {
    conditions.push(
      eb.exists(
        eb
          .selectFrom('PageTeamAccess')
          .select(sql.lit(1).as('one'))
          .whereRef('pageId', '=', ref)
          .where('teamId', 'in', teamIds)
      )
    )
    conditions.push(
      eb.exists(
        eb
          .selectFrom('PageOrganizationAccess')
          .select(sql.lit(1).as('one'))
          .whereRef('pageId', '=', ref)
          .where('orgId', 'in', eb.selectFrom('Team').select('orgId').where('id', 'in', teamIds))
      )
    )
  }

  if (conditions.length === 0) return eb.lit(true)
  return eb.or(conditions)
}

export const pages: NonNullable<UserResolvers['pages']> = async (
  _source,
  {parentPageId, isPrivate, first, after, teamId, isArchived, textFilter},
  {authToken, resourceGrants}
) => {
  if (parentPageId && teamId) {
    throw new GraphQLError('parentPageId and teamId are mutually exclusive')
  }

  const viewerId = getUserId(authToken)
  const grantCriteria = resourceGrants?.getPageGrantCriteria() ?? null
  const dbParentPageId = parentPageId
    ? CipherId.fromClient(parentPageId)[0]
    : parentPageId === null
      ? null
      : undefined
  const isPrivateDefined = typeof isPrivate === 'boolean'
  if (isArchived) {
    // this is a separate query because deletedBy is going to be a more exclusive index
    // and archived items use deletedAt for their cursor instead of a sortOrder
    const pagesPlusOne = await selectPages()
      .where('deletedBy', '=', viewerId)
      .$if(!!teamId, (qb) => qb.where('teamId', '=', teamId!))
      .$if(dbParentPageId === null, (qb) => qb.where('parentPageId', 'is', null))
      .$if(!!dbParentPageId, (qb) => qb.where('parentPageId', '=', dbParentPageId!))
      .$if(isPrivateDefined, (qb) => qb.where('isPrivate', '=', isPrivate!))
      .$if(!!textFilter, (qb) => qb.where('title', 'ilike', `%${textFilter}%`))
      .$if(!!grantCriteria, (qb) =>
        qb.where((eb) => buildGrantFilter(eb, 'Page.id', grantCriteria!))
      )
      .orderBy('deletedAt', 'desc')
      .$narrowType<{deletedAt: NotNull}>()
      .execute()
    const hasNextPage = pagesPlusOne.length > first
    const pages = hasNextPage ? pagesPlusOne.slice(0, -1) : pagesPlusOne
    return {
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: pages.at(0)?.deletedAt.toJSON(),
        endCursor: pages.at(-1)?.deletedAt.toJSON()
      },
      edges: pages.map((page) => ({
        node: page,
        cursor: page.deletedAt.toJSON()
      }))
    }
  }
  if (isPrivate === false) {
    const pg = getKysely()
    // this is for shared pages, which only return the top-most accessible page
    const pagesPlusOne = await pg
      .with('teams', (qc) =>
        qc
          .selectFrom('TeamMember')
          .select('teamId')
          .where('userId', '=', viewerId)
          .where('isNotRemoved', '=', true)
      )
      .with('pages', (qc) =>
        selectPages(qc as any)
          .innerJoin('PageAccess', 'PageAccess.pageId', 'Page.id')
          .where('PageAccess.userId', '=', viewerId)
          .where('deletedBy', 'is', null)
      )

      .selectFrom('pages as p')
      .selectAll()
      // if a parent page is in the result set, exclude children
      .where(({not, exists, selectFrom}) =>
        not(
          exists(
            selectFrom('pages as parent').select('id').whereRef('parent.id', '=', 'p.parentPageId')
          )
        )
      )
      // if the user has access to that team, don't put it in Shared Pages
      // this must go down here because a parentPage has the teamId so we need to first remove all descendants
      .where(({or, eb, selectFrom}) =>
        or([eb('teamId', 'is', null), eb('teamId', 'not in', selectFrom('teams').select('teamId'))])
      )
      .where('isPrivate', '=', false) // this must go down here so a shared child of a private page doesn't show up
      .$if(!!textFilter, (qb) => qb.where('title', 'ilike', `%${textFilter}%`))
      .$if(!!grantCriteria, (qb) => qb.where((eb) => buildGrantFilter(eb, 'p.id', grantCriteria!)))
      .leftJoin('PageUserSortOrder', (join) =>
        join
          .on('PageUserSortOrder.userId', '=', viewerId)
          .onRef('PageUserSortOrder.pageId', '=', 'p.id')
      )
      .select(({ref}) => [ref('PageUserSortOrder.sortOrder').as('userSortOrder'), 'p.sortOrder'])
      .orderBy('userSortOrder', (od) => od.asc().nullsFirst())
      .$if(!!after, (qb) => qb.where('PageUserSortOrder.sortOrder', '>', after!))
      .limit(first + 1)
      .execute()
    const hasUnsorted = pagesPlusOne[0]?.userSortOrder === null
    if (hasUnsorted) {
      let curSortOrder = ' '
      // the nulls will be at the beginning of the array
      await Promise.all(
        pagesPlusOne.toReversed().map((p) => {
          if (p.userSortOrder) {
            curSortOrder = p.userSortOrder
            return undefined
          } else {
            p.userSortOrder = positionBefore(curSortOrder)
            curSortOrder = p.userSortOrder
            return pg
              .insertInto('PageUserSortOrder')
              .values({
                pageId: p.id,
                userId: viewerId,
                sortOrder: p.userSortOrder
              })
              .execute()
          }
        })
      )
    }
    const hasNextPage = pagesPlusOne.length > first
    const pages = hasNextPage ? pagesPlusOne.slice(0, -1) : pagesPlusOne
    return {
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: pages.at(0)?.userSortOrder!,
        endCursor: pages.at(-1)?.userSortOrder!
      },
      edges: pages.map((page) => ({
        node: page,
        cursor: page.userSortOrder!
      }))
    }
  }
  const pagesPlusOne = await selectPages()
    .innerJoin('PageAccess', 'PageAccess.pageId', 'Page.id')
    .$if(!!dbParentPageId, (qb) => qb.where('parentPageId', '=', dbParentPageId!))
    .where('PageAccess.userId', '=', viewerId)
    .$if(!!teamId, (qb) => qb.where('teamId', '=', teamId!))
    .$if(isPrivateDefined, (qb) => qb.where('isPrivate', '=', isPrivate!))
    .$if(dbParentPageId === null, (qb) => qb.where('parentPageId', 'is', null))
    .$if(teamId === null, (qb) => qb.where('teamId', 'is', null))
    .$if(!!after, (qb) => qb.where('sortOrder', '>', after!))
    .$if(!!textFilter, (qb) => qb.where('title', 'ilike', `%${textFilter}%`))
    .$if(!!grantCriteria, (qb) => qb.where((eb) => buildGrantFilter(eb, 'Page.id', grantCriteria!)))
    .where('deletedBy', 'is', null)
    .orderBy('sortOrder')
    .limit(first + 1)
    .execute()
  // ok now we have ALL the pages the user has access to, but we need to filter out the ones
  const hasNextPage = pagesPlusOne.length > first
  const pages = hasNextPage ? pagesPlusOne.slice(0, -1) : pagesPlusOne

  return {
    pageInfo: {
      hasNextPage,
      hasPreviousPage: false,
      startCursor: pages.at(0)?.sortOrder,
      endCursor: pages.at(-1)?.sortOrder
    },
    edges: pages.map((page) => ({
      node: page,
      cursor: page.sortOrder
    }))
  }
}
