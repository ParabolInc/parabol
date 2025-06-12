import {sql} from 'kysely'
import getKysely from '../../../../postgres/getKysely'
import {selectDescendantPages} from '../../../../postgres/select'
import {updatePageAccessTable} from '../../../../postgres/updatePageAccessTable'

export const movePageToNewTeam = async (
  viewerId: string,
  pageId: number,
  teamId: string,
  sortOrder: string
) => {
  const pg = getKysely()
  const trx = await pg.startTransaction().execute()

  await selectDescendantPages(trx, pageId)
    .with('delUsers', (qc) =>
      qc
        .deleteFrom('PageUserAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .where('userId', '!=', viewerId)
    )
    .with('delTeams', (qc) =>
      qc
        .deleteFrom('PageTeamAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .where('teamId', '!=', teamId)
    )
    .with('delOrgs', (qc) =>
      qc
        .deleteFrom('PageOrganizationAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
    )
    .with('delExts', (qc) =>
      qc
        .deleteFrom('PageExternalAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
    )
    .with('upsertViewerOwner', (qc) =>
      qc
        .insertInto('PageUserAccess')
        .columns(['pageId', 'userId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants as d')
            .select((eb) => [
              eb.ref('d.id').as('pageId'),
              eb.val(viewerId).as('userId'),
              sql`'owner'::"PageRoleEnum"`.as('role')
            ])
        )
        .onConflict((oc) =>
          oc
            .columns(['pageId', 'userId'])
            .doUpdateSet((eb) => ({
              role: eb.ref('excluded.role')
            }))
            .whereRef('PageUserAccess.role', '!=', 'excluded.role')
        )
    )
    .with('upsertTeamEditor', (qc) =>
      qc
        .insertInto('PageTeamAccess')
        .columns(['pageId', 'teamId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants as d')
            .select((eb) => [
              eb.ref('d.id').as('pageId'),
              eb.val(teamId).as('teamId'),
              sql`'editor'::"PageRoleEnum"`.as('role')
            ])
        )
        .onConflict((oc) =>
          oc
            .columns(['pageId', 'teamId'])
            .doUpdateSet({role: 'editor'})
            .whereRef('PageTeamAccess.role', '!=', 'excluded.role')
        )
    )
    .updateTable('Page')
    .set({
      teamId,
      parentPageId: null,
      isParentLinked: true,
      isPrivate: false,
      sortOrder,
      ancestorIds: []
    })
    .where('id', '=', pageId)
    .execute()

  await updatePageAccessTable(trx, pageId, {skipUnionOrg: true})
    .selectNoFrom(sql`1`.as('t'))
    .execute()
  await trx.commit().execute()
}
