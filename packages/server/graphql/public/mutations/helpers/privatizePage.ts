import getKysely from '../../../../postgres/getKysely'
import {selectDescendantPages} from '../../../../postgres/select'
import {updatePageAccessTable} from '../../../../postgres/updatePageAccessTable'
import {updatePageAncestorIds} from '../../../../postgres/updatePageAncestorIds'
import {revalidateYjsConnections} from '../../../../utils/tiptap/revalidateYjsConnections'

export const privatizePage = async (viewerId: string, pageId: number, sortOrder: string) => {
  const pg = getKysely()
  await pg.transaction().execute(async (trx) => {
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
        isPrivate: true,
        sortOrder
      })
      .where('id', '=', pageId)
      .execute()
    await updatePageAncestorIds(trx, pageId)
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
    await updatePageAccessTable(trx, pageId)
  })
  await revalidateYjsConnections({pageTreeIds: [pageId]})
}
