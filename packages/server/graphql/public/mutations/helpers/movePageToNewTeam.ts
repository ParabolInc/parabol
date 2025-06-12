import getKysely from '../../../../postgres/getKysely'
import {selectDescendantPages} from '../../../../postgres/select'

export const movePageToNewTeam = async (
  viewerId: string,
  pageId: number,
  teamId: string,
  sortOrder: string
) => {
  const pg = getKysely()

  const descendants = await selectDescendantPages(pg, pageId)
    .selectFrom('descendants')
    .select('id')
    .execute()

  const pageIds = descendants.map(({id}) => id)
  const viewerInserts = pageIds.map((pageId) => ({
    pageId,
    userId: viewerId,
    role: 'owner' as const
  }))
  const teamInserts = pageIds.map((pageId) => ({
    pageId,
    teamId,
    role: 'editor' as const
  }))
  const trx = await pg.startTransaction().execute()

  await Promise.all([
    trx
      .deleteFrom('PageUserAccess')
      .where('pageId', 'in', pageIds)
      .where('userId', '!=', viewerId)
      .execute(),
    trx
      .deleteFrom('PageTeamAccess')
      .where('pageId', 'in', pageIds)
      .where('teamId', '!=', teamId)
      .execute(),
    trx.deleteFrom('PageOrganizationAccess').where('pageId', 'in', pageIds).execute(),
    trx.deleteFrom('PageExternalAccess').where('pageId', 'in', pageIds).execute(),
    // viewer ownership may have come from a team/org, so re-add it here
    trx
      .insertInto('PageUserAccess')
      .values(viewerInserts)
      .onConflict((oc) =>
        oc
          .columns(['pageId', 'userId'])
          .doUpdateSet({role: 'owner'})
          .whereRef('PageUserAccess.role', '!=', 'excluded.role')
      )
      .execute(),
    trx
      .insertInto('PageTeamAccess')
      .values(teamInserts)
      .onConflict((oc) =>
        oc
          .columns(['pageId', 'teamId'])
          .doUpdateSet({role: 'editor'})
          .whereRef('PageTeamAccess.role', '!=', 'excluded.role')
      )
      .execute(),
    trx
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
  ])

  await trx
    .with('unionAccess', (qc) =>
      qc
        .selectFrom('PageUserAccess')
        .select(['userId', 'pageId', 'role'])
        .where('pageId', 'in', pageIds)
        .unionAll(({parens, selectFrom}) =>
          parens(
            selectFrom('PageTeamAccess')
              .innerJoin('TeamMember', 'PageTeamAccess.teamId', 'TeamMember.teamId')
              .where('pageId', 'in', pageIds)
              .where('TeamMember.isNotRemoved', '=', true)
              .select(['TeamMember.userId', 'pageId', 'role'])
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
    .deleteFrom('PageAccess')
    .where('pageId', 'in', pageIds)
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
    .execute()
  await trx.commit().execute()
}
