import getKysely from '../getKysely'
import {selectDescendantPages} from '../select'

export const revokeAccessExceptViewer = (pageId: number, viewerId: string) => {
  const pg = getKysely()
  return (
    selectDescendantPages(pg, pageId)
      // don't delete the user record because the insert will see the same snapshot as this CTE, so it must do nothing if it exists
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
      .with('reinsertOwner', (qc) =>
        qc
          // ownership may have come from a team/org, so re-add it here
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
              .where(({eb, ref}) => eb(ref('role'), '!=', ref('excluded.role')))
          )
      )
  )
}
