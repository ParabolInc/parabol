import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {feistelCipher} from '../../../utils/feistelCipher'
import {MutationResolvers} from '../resolverTypes'
import {PAGE_ROLES} from '../rules/hasPageAccess'

const updatePageAccess: MutationResolvers['updatePageAccess'] = async (
  _source,
  {pageId, subjectType, subjectId, role, unlinkApproved},
  {dataLoader}
) => {
  const pg = getKysely()
  const dbPageId = feistelCipher.decrypt(Number(pageId.split(':')[1]))
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
  const table = tableMap[subjectType]
  const typeId = subjectMap[subjectType]

  // If this mutation could trigger the page to be unlinked from its parent, throw a warning if not approved
  if (!unlinkApproved) {
    const page = await dataLoader.get('pages').load(dbPageId)
    if (!page) throw new GraphQLError('Page not found')
    const {parentPageId} = page
    if (parentPageId) {
      // get the existing role for this
      const oldRoleRes = await pg
        .selectFrom(pg.dynamic.table(table).as('t'))
        .select('role')
        .where('pageId', '=', dbPageId)
        .where(sql`${typeId}`, '=', subjectId)
        .executeTakeFirst()
      const oldRole = oldRoleRes?.role ?? undefined
      const isMoreRestrictive =
        !role || (oldRole && PAGE_ROLES.indexOf(role) > PAGE_ROLES.indexOf(oldRole))
      if (isMoreRestrictive) {
        throw new GraphQLError('This will unlink the page permissions from the parent', {
          extensions: {
            code: 'UNAPPROVED_UNLINK'
          }
        })
      }
    }
  }

  // all access for child pages and child unlinking is performed within PG via triggers
  const trx = await pg.startTransaction().execute()
  if (!role) {
    await trx
      .deleteFrom(trx.dynamic.table(table).as('t'))
      .where('pageId', '=', dbPageId)
      .where(sql`${typeId}`, '=', subjectId)
      .execute()
  } else {
    await trx
      .insertInto(table)
      .values({
        pageId: dbPageId,
        [typeId]: subjectId,
        role
      })
      .onConflict((oc) => oc.columns(['pageId', typeId]).doUpdateSet({role}))
      .execute()
  }
  const atLeastOneOwner = await trx
    .selectFrom('PageAccess')
    .select('role')
    .where('pageId', '=', dbPageId)
    .where('role', '=', 'owner')
    .limit(1)
    .executeTakeFirst()

  if (atLeastOneOwner) {
    trx.commit().execute()
  } else {
    trx.rollback().execute()
    throw new GraphQLError('A Page must have at least one owner')
  }

  return {pageId: dbPageId}
}

export default updatePageAccess
