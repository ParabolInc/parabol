import getKysely from '../../../../postgres/getKysely'
import {selectDescendantPages} from '../../../../postgres/select'

export const privatizePage = async (viewerId: string, pageId: number, sortOrder: string) => {
  const pg = getKysely()
  const trx = await pg.startTransaction().execute()
  await selectDescendantPages(trx, pageId)
    // revoke access for everyone except the viewer
    .with('delUsers', (qc) =>
      qc
        .deleteFrom('PageUserAccess')
        .where('pageId', 'in', (qb) => qb.selectFrom('descendants').select('id'))
        .where('userId', '!=', viewerId)
    )
    .with('delTeams', (qc) =>
      qc
        .deleteFrom('PageTeamAccess')
        .where('pageId', 'in', (qb) => qb.selectFrom('descendants').select('id'))
    )
    .with('delOrgs', (qc) =>
      qc
        .deleteFrom('PageOrganizationAccess')
        .where('pageId', 'in', (qb) => qb.selectFrom('descendants').select('id'))
    )
    .with('delExts', (qc) =>
      qc
        .deleteFrom('PageExternalAccess')
        .where('pageId', 'in', (qb) => qb.selectFrom('descendants').select('id'))
    )
    .updateTable('Page')
    .set({
      teamId: null,
      parentPageId: null,
      isParentLinked: true,
      sortOrder,
      ancestorIds: []
    })
    .where('id', '=', pageId)
    .execute()
  await selectDescendantPages(trx, pageId)
    // viewer ownership may have come from a team/org, so re-add it here
    .insertInto('PageUserAccess')
    .columns(['pageId', 'userId', 'role'])
    .expression((eb) =>
      eb
        .selectFrom('descendants')
        .select(['id', eb.val(viewerId).as('userId'), eb.val('owner').as('role')])
    )
    .onConflict((oc) =>
      oc
        .columns(['pageId', 'userId'])
        .doUpdateSet({role: 'owner'})
        .where(({eb, ref}) => eb(ref('PageUserAccess.role'), '!=', ref('excluded.role')))
    )
    .execute()
  await trx.commit().execute()
}
