import {revokeAccessExceptViewer} from '../../../../postgres/helpers/revokeAccessExceptViewer'

export const movePageToNewTeam = async (
  viewerId: string,
  pageId: number,
  teamId: string,
  sortOrder: string
) => {
  // When moving to a new team, revoke all previous access then add editor access for the team for all descendants
  await revokeAccessExceptViewer(pageId, viewerId)
    .with('insertNewTeam', (qc) =>
      qc
        .insertInto('PageTeamAccess')
        .columns(['pageId', 'teamId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants as d')
            .innerJoin('PageTeamAccess as pta', 'pta.pageId', 'd.parentPageId')
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
      teamId: null,
      parentPageId: null,
      isParentLinked: true,
      sortOrder
    })
    .where('id', '=', pageId)
    .execute()
}
