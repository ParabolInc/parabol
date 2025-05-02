import {sql} from 'kysely'
import getKysely from '../../../postgres/getKysely'
import {feistelCipher} from '../../../utils/feistelCipher'
import {MutationResolvers} from '../resolverTypes'

const updatePageAccess: MutationResolvers['updatePageAccess'] = async (
  _source,
  {pageId, subjectType, subjectId, role}
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

  if (!role) {
    await pg
      .deleteFrom(pg.dynamic.table(table).as('t'))
      .where('pageId', '=', dbPageId)
      .where(sql`${typeId}`, '=', subjectId)
      .execute()
  } else {
    await pg
      .insertInto(table)
      .values({
        pageId: dbPageId,
        [typeId]: subjectId,
        role
      })
      .onConflict((oc) => oc.columns(['pageId', typeId]).doUpdateSet({role}))
      .execute()
  }

  return {pageId: dbPageId}
}

export default updatePageAccess
