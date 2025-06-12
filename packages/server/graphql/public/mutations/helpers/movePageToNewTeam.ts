import getKysely from '../../../../postgres/getKysely'
import {selectDescendantPages} from '../../../../postgres/select'

export const movePageToNewTeam = async (
  viewerId: string,
  pageId: number,
  teamId: string,
  sortOrder: string
) => {
  const pg = getKysely()
  // When moving to a new team, revoke all previous access then add editor access for the team for all descendants
  await selectDescendantPages(pg, pageId)
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
        .where('teamId', '!=', teamId)
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
    )
    .with('insertNewTeam', (qc) =>
      qc
        .insertInto('PageTeamAccess')
        .columns(['pageId', 'teamId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants as d')
            .select(({ref, val}) => [
              ref('d.id').as('pageId'),
              val(teamId).as('teamId'),
              val('editor').as('role')
            ])
        )
        .onConflict((oc) =>
          oc
            .columns(['pageId', 'teamId'])
            .doUpdateSet((eb) => ({
              role: eb.ref('excluded.role')
            }))
            .where((eb) => eb(eb.ref('PageTeamAccess.role'), '!=', eb.ref('excluded.role')))
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
}
