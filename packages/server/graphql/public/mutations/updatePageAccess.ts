import {GraphQLError} from 'graphql'
import type {ControlledTransaction} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {selectDescendantPages} from '../../../postgres/select'
import type {DB} from '../../../postgres/types/pg'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {MutationResolvers, type PageRoleEnum, type PageSubjectEnum} from '../resolverTypes'
import {PAGE_ROLES} from '../rules/hasPageAccess'

const getNextIsPrivate = async (
  trx: ControlledTransaction<DB, []>,
  pageId: number,
  isPrivate: boolean,
  role: PageRoleEnum | null,
  viewerId: string,
  subjectType: PageSubjectEnum,
  subjectId: string
) => {
  console.log({isPrivate, role})
  if (isPrivate && role) {
    return subjectType !== 'user' || subjectId !== viewerId ? false : undefined
  }
  if (isPrivate || role) return undefined
  // only need to do the expensive query if removing access on a public page might make it private
  const willBePrivateRes = await trx
    .selectNoFrom(({and, not, exists, selectFrom}) => [
      and([
        selectFrom('PageUserAccess')
          .select(({eb, fn}) => eb(fn.countAll(), '<=', 1).as('val'))
          .where('pageId', '=', pageId)
          .limit(2),
        not(exists(selectFrom('PageTeamAccess').select('pageId').where('pageId', '=', pageId))),
        not(
          exists(selectFrom('PageOrganizationAccess').select('pageId').where('pageId', '=', pageId))
        ),
        not(exists(selectFrom('PageExternalAccess').select('pageId').where('pageId', '=', pageId)))
      ]).as('isPrivate')
    ])
    .executeTakeFirstOrThrow()
  console.log({willBePrivateRes})
  return willBePrivateRes.isPrivate ? true : undefined
}

const updatePageAccess: MutationResolvers['updatePageAccess'] = async (
  _source,
  {pageId, subjectType, subjectId, role, unlinkApproved},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const pg = getKysely()
  const [dbPageId] = CipherId.fromClient(pageId)
  const tableMap = {
    user: 'PageUserAccess',
    team: 'PageTeamAccess',
    organization: 'PageOrganizationAccess',
    external: 'PageExternalAccess'
  } as const
  const subjectMap = {
    user: 'userId',
    team: 'teamId',
    organization: 'orgId',
    external: 'email'
  } as const

  let nextSubjectType = subjectType
  let nextSubjectId = subjectId
  if (role && subjectType === 'external') {
    const existingUser = await getUserByEmail(subjectId)
    if (existingUser) {
      nextSubjectType = 'user'
      nextSubjectId = existingUser.id
    }
  }
  const table = tableMap[nextSubjectType]
  const typeId = subjectMap[nextSubjectType]

  let unlinkFromParent = false
  const page = await dataLoader.get('pages').load(dbPageId)
  if (!page) throw new GraphQLError('Page not found')
  const {parentPageId, isParentLinked} = page
  if (parentPageId && isParentLinked) {
    // get the existing role for this
    const parentRoleRes = await pg
      .selectFrom(pg.dynamic.table(table).as('t'))
      .select('role')
      .where('pageId', '=', parentPageId)
      .where(pg.dynamic.ref(typeId), '=', nextSubjectId)
      .executeTakeFirst()
    if (parentRoleRes) {
      const isMoreRestrictive =
        !role || PAGE_ROLES.indexOf(role) > PAGE_ROLES.indexOf(parentRoleRes.role)
      if (isMoreRestrictive) {
        if (!unlinkApproved) {
          throw new GraphQLError('This will unlink the page permissions from the parent', {
            extensions: {
              code: 'UNAPPROVED_UNLINK'
            }
          })
        }
        unlinkFromParent = true
      }
    }
  }

  const trx = await pg.startTransaction().execute()
  if (!role) {
    await selectDescendantPages(trx, dbPageId)
      .deleteFrom(trx.dynamic.table(table).as('t'))
      .where('pageId', 'in', (qb) => qb.selectFrom('descendants').select('id'))
      .where(trx.dynamic.ref(typeId), '=', nextSubjectId)
      .execute()
  } else {
    await selectDescendantPages(trx, dbPageId)
      .insertInto(table)
      .columns(['pageId', typeId as any, 'role'])
      .expression((eb) =>
        eb
          .selectFrom('descendants')
          .select(({val, ref}) => [
            ref('id').as('pageId'),
            val(nextSubjectId).as(typeId),
            val(role).as('role')
          ])
      )
      .onConflict((oc) =>
        oc
          .columns(['pageId', typeId])
          .doUpdateSet({role})
          .where(({eb, ref}) => eb(ref(`${table}.role`), '!=', ref('excluded.role')))
      )
      .execute()
  }

  const strongestRole = await selectDescendantPages(trx, dbPageId)
    .with('unionAccess', (qc) =>
      qc
        .selectFrom('PageUserAccess')
        .select(['userId', 'pageId', 'role'])
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .unionAll(({parens, selectFrom}) =>
          parens(
            selectFrom('PageTeamAccess')
              .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
              .innerJoin('TeamMember', 'PageTeamAccess.teamId', 'TeamMember.teamId')
              .where('TeamMember.isNotRemoved', '=', true)
              .select(['TeamMember.userId', 'pageId', 'role'])
          )
        )
        .unionAll(({parens, selectFrom}) =>
          parens(
            selectFrom('PageOrganizationAccess')
              .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
              .innerJoin(
                'OrganizationUser',
                'PageOrganizationAccess.orgId',
                'OrganizationUser.orgId'
              )
              .where('OrganizationUser.removedAt', 'is', null)
              .select(['OrganizationUser.userId', 'pageId', 'PageOrganizationAccess.role'])
          )
        )
    )
    .with('nextPageAccess', (qc) =>
      qc
        .selectFrom('unionAccess')
        .select(({fn}) => ['userId', 'pageId', fn.min('role').as('role')])
        .groupBy(['userId', 'pageId'])
    )
    .with('insertNew', (qc) =>
      qc
        .insertInto('PageAccess')
        .columns(['userId', 'pageId', 'role'])
        .expression((eb) => eb.selectFrom('nextPageAccess').select(['userId', 'pageId', 'role']))
        .onConflict((oc) =>
          oc

            .columns(['userId', 'pageId'])
            .doUpdateSet((eb) => ({
              role: eb.ref('excluded.role')
            }))
            .where(({eb, ref}) => eb('PageAccess.role', 'is distinct from', ref('excluded.role')))
        )
    )
    .with('deleteOld', (qc) =>
      qc
        .deleteFrom('PageAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .where(({not, exists, selectFrom}) =>
          not(
            exists(
              selectFrom('nextPageAccess')
                .select('userId')
                .whereRef('nextPageAccess.userId', '=', 'PageAccess.userId')
                .whereRef('nextPageAccess.pageId', '=', 'PageAccess.pageId')
            )
          )
        )
    )
    .selectFrom('PageAccess')
    .select(({fn}) => fn.min('role').as('role'))
    // since all children will have identical access, no need to query descendants
    .where('pageId', '=', dbPageId)
    .executeTakeFirst()

  if (!strongestRole || strongestRole.role !== 'owner') {
    await trx.rollback().execute()
    throw new GraphQLError('A Page must have at least one owner')
  }

  const willBePrivate = await getNextIsPrivate(
    trx,
    dbPageId,
    page.isPrivate,
    role || null,
    viewerId,
    nextSubjectType,
    nextSubjectId
  )

  console.log({willBePrivate, unlinkFromParent})
  if (willBePrivate !== undefined || unlinkFromParent) {
    console.log('updating page', unlinkFromParent, willBePrivate)
    await trx
      .updateTable('Page')
      .set({isParentLinked: unlinkFromParent ? false : undefined, isPrivate: willBePrivate})
      .where('id', '=', dbPageId)
      .execute()
  }

  await trx.commit().execute()
  dataLoader.get('pages').clear(dbPageId)
  return {pageId: dbPageId}
}

export default updatePageAccess
