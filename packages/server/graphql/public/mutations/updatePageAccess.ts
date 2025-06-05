import {GraphQLError} from 'graphql'
import getKysely from '../../../postgres/getKysely'
import {getUserByEmail} from '../../../postgres/queries/getUsersByEmails'
import {selectDescendantPages} from '../../../postgres/select'
import {CipherId} from '../../../utils/CipherId'
import {MutationResolvers} from '../resolverTypes'
import {PAGE_ROLES} from '../rules/hasPageAccess'

const updatePageAccess: MutationResolvers['updatePageAccess'] = async (
  _source,
  {pageId, subjectType, subjectId, role, unlinkApproved},
  {dataLoader}
) => {
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
          .where(({eb, ref}) => eb(ref('role'), '!=', ref('excluded.role')))
      )
      .execute()
  }

  const atLeastOneOwner = await Promise.all([
    unlinkFromParent &&
      trx.updateTable('Page').set({isParentLinked: false}).where('id', '=', dbPageId).execute(),
    // only need to check the top-most page because all LINKED children are guaranteed to have at least the same access
    trx
      .selectFrom('PageAccess')
      .select('role')
      .where('pageId', '=', dbPageId)
      .where('role', '=', 'owner')
      .limit(1)
      .executeTakeFirst()
  ])

  if (atLeastOneOwner) {
    await trx.commit().execute()
  } else {
    await trx.rollback().execute()
    throw new GraphQLError('A Page must have at least one owner')
  }
  dataLoader.get('pages').clear(dbPageId)
  return {pageId: dbPageId}
}

export default updatePageAccess
