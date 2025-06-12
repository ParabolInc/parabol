import {sql} from 'kysely'
import getKysely from '../../../../postgres/getKysely'
import {selectDescendantPages} from '../../../../postgres/select'

export const movePageToNewParent = async (
  viewerId: string,
  pageId: number,
  parentPageId: number,
  sortOrder: string,
  ancestorIds: number[]
) => {
  const pg = getKysely()
  const trx = await pg.startTransaction().execute()

  await selectDescendantPages(trx, pageId)
    // Remove previous access for all descendants _that doesn't match the new parent's access_ (the exclusion means fewer writes)
    // Copy parent access to all descendants (if new parent has a different role, adopt that)
    .with('delUsers', (qc) =>
      qc
        .deleteFrom('PageUserAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .where(({eb, not, exists}) =>
          not(
            exists(
              eb
                .selectFrom('PageUserAccess as parentAccess')
                .where('parentAccess.pageId', '=', parentPageId)
                .whereRef('parentAccess.userId', '=', 'PageUserAccess.userId')
            )
          )
        )
        .where('userId', '!=', viewerId)
    )
    .with('delTeams', (qc) =>
      qc
        .deleteFrom('PageTeamAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .where(({eb, not, exists}) =>
          not(
            exists(
              eb
                .selectFrom('PageTeamAccess as parentAccess')
                .where('parentAccess.pageId', '=', parentPageId)
                .whereRef('parentAccess.teamId', '=', 'PageTeamAccess.teamId')
            )
          )
        )
    )
    .with('delOrgs', (qc) =>
      qc
        .deleteFrom('PageOrganizationAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .where(({eb, not, exists}) =>
          not(
            exists(
              eb
                .selectFrom('PageOrganizationAccess as parentAccess')
                .where('parentAccess.pageId', '=', parentPageId)
                .whereRef('parentAccess.orgId', '=', 'PageOrganizationAccess.orgId')
            )
          )
        )
    )
    .with('delExts', (qc) =>
      qc
        .deleteFrom('PageExternalAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .where(({eb, not, exists}) =>
          not(
            exists(
              eb
                .selectFrom('PageExternalAccess as parentAccess')
                .where('parentAccess.pageId', '=', parentPageId)
                .whereRef('parentAccess.email', '=', 'PageExternalAccess.email')
            )
          )
        )
    )
    .with('upsertUsers', (qc) =>
      qc
        .insertInto('PageUserAccess')
        .columns(['pageId', 'userId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants as d')
            .crossJoin(
              eb
                .selectFrom('PageUserAccess as pua')
                .select(['pua.userId', 'pua.role'])
                .where('pua.pageId', '=', parentPageId)
                .as('pua')
            )
            .select(['d.id as pageId', 'pua.userId', 'pua.role'])
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
    .with('upsertTeams', (qc) =>
      qc
        .insertInto('PageTeamAccess')
        .columns(['pageId', 'teamId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants as d')
            .crossJoin(
              eb
                .selectFrom('PageTeamAccess as pta')
                .select(['pta.teamId', 'pta.role'])
                .where('pta.pageId', '=', parentPageId)
                .as('pta')
            )
            .select(['d.id as pageId', 'pta.teamId', 'pta.role'])
        )
        .onConflict((oc) =>
          oc
            .columns(['pageId', 'teamId'])
            .doUpdateSet((eb) => ({
              role: eb.ref('excluded.role')
            }))
            .whereRef('PageTeamAccess.role', '!=', 'excluded.role')
        )
    )
    .with('upsertOrganizations', (qc) =>
      qc
        .insertInto('PageOrganizationAccess')
        .columns(['pageId', 'orgId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants as d')
            .crossJoin(
              eb
                .selectFrom('PageOrganizationAccess as poa')
                .select(['poa.orgId', 'poa.role'])
                .where('poa.pageId', '=', parentPageId)
                .as('poa')
            )
            .select(['d.id as pageId', 'poa.orgId', 'poa.role'])
        )
        .onConflict((oc) =>
          oc
            .columns(['pageId', 'orgId'])
            .doUpdateSet((eb) => ({
              role: eb.ref('excluded.role')
            }))
            .whereRef('PageOrganizationAccess.role', '!=', 'excluded.role')
        )
    )
    .with('upsertExternals', (qc) =>
      qc
        .insertInto('PageExternalAccess')
        .columns(['pageId', 'email', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants as d')
            .crossJoin(
              eb
                .selectFrom('PageExternalAccess as pea')
                .select(['pea.email', 'pea.role'])
                .where('pea.pageId', '=', parentPageId)
                .as('pea')
            )
            .select(['d.id as pageId', 'pea.email', 'pea.role'])
        )
        .onConflict((oc) =>
          oc
            .columns(['pageId', 'email'])
            .doUpdateSet((eb) => ({
              role: eb.ref('excluded.role')
            }))
            .whereRef('PageExternalAccess.role', '!=', 'excluded.role')
        )
    )
    .updateTable('Page')
    .set((eb) => ({
      teamId: null,
      parentPageId,
      isPrivate: eb.selectFrom('Page').select('isPrivate').where('id', '=', parentPageId),
      isParentLinked: true,
      sortOrder,
      ancestorIds: [...ancestorIds, parentPageId]
    }))
    .where('id', '=', pageId)
    .execute()

  // upsert viewer as owner IIF nothing else is the owner
  // nothing else is the owner if PageAccess(pageId) has no owner
  const strongestRole = await selectDescendantPages(trx, pageId)
    .with('unionAccess', (qc) =>
      qc
        .selectFrom('PageUserAccess')
        .select(['userId', 'pageId', 'role'])
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .unionAll(({parens, selectFrom}) =>
          parens(
            selectFrom('PageTeamAccess')
              .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
              .innerJoin('TeamMember', 'PageTeamAccess.teamId', 'TeamMember.teamId')
              .where('TeamMember.isNotRemoved', '=', true)
              .select(['TeamMember.userId', 'pageId', 'role'])
          )
        )
        .unionAll(({parens, selectFrom}) =>
          parens(
            selectFrom('PageOrganizationAccess')
              .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
              .innerJoin(
                'OrganizationUser',
                'PageOrganizationAccess.orgId',
                'OrganizationUser.orgId'
              )
              .where('OrganizationUser.removedAt', 'is', null)
              .select(['OrganizationUser.userId', 'pageId', 'PageOrganizationAccess.role'])
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
    .with('deleteOld', (qc) =>
      qc
        .deleteFrom('PageAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
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
    )
    .selectFrom('PageAccess')
    .select(({fn}) => fn.min('role').as('role'))
    // since all children will have identical access, no need to query descendants
    .where('pageId', '=', pageId)
    .where('userId', '=', viewerId)
    .executeTakeFirstOrThrow()

  if (strongestRole.role !== 'owner') {
    // make sure the viewer stays an owner no matter what so they can undo the action
    await selectDescendantPages(trx, pageId)
      .with('insertNew', (qc) =>
        qc
          .insertInto('PageAccess')
          .columns(['userId', 'pageId', 'role'])
          .expression((eb) =>
            eb
              .selectFrom('descendants')
              .select((eb) => [
                eb.ref('descendants.id').as('pageId'),
                eb.val(viewerId).as('userId'),
                sql`'owner'::"PageRoleEnum"`.as('role')
              ])
          )
          .onConflict((oc) =>
            oc

              .columns(['userId', 'pageId'])
              .doUpdateSet((eb) => ({
                role: eb.ref('excluded.role')
              }))
              .where(({eb, ref}) => eb('PageAccess.role', 'is distinct from', ref('excluded.role')))
          )
      )
      .insertInto('PageUserAccess')
      .columns(['pageId', 'userId', 'role'])
      .expression((eb) =>
        eb
          .selectFrom('descendants as d')
          // .where(({not, exists, selectFrom}) =>
          //   not(
          //     exists(
          //       selectFrom('PageAccess')
          //         .select('pageId')
          //         .whereRef('PageAccess.pageId', '=', 'd.id')
          //         .where('PageAccess.userId', '=', viewerId)
          //         .where('PageAccess.role', '=', 'owner')
          //     )
          //   )
          // )
          .select((eb) => [
            eb.ref('d.id').as('pageId'),
            eb.val(viewerId).as('userId'),
            sql`'owner'::"PageRoleEnum"`.as('role')
          ])
          .distinct()
      )
      .onConflict((oc) =>
        oc
          .columns(['pageId', 'userId'])
          .doUpdateSet((eb) => ({
            role: eb.ref('excluded.role')
          }))
          .whereRef('PageUserAccess.role', '!=', 'excluded.role')
      )
      .execute()
  }
  await trx.commit().execute()
}
