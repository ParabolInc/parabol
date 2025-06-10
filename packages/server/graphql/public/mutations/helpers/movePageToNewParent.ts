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
  console.log('next ancestors', [...ancestorIds, parentPageId])
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
            .where((eb) => eb(eb.ref('PageUserAccess.role'), '!=', eb.ref('excluded.role')))
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
            .where((eb) => eb(eb.ref('PageTeamAccess.role'), '!=', eb.ref('excluded.role')))
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
            .where((eb) => eb(eb.ref('PageOrganizationAccess.role'), '!=', eb.ref('excluded.role')))
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
            .where((eb) => eb(eb.ref('PageExternalAccess.role'), '!=', eb.ref('excluded.role')))
        )
    )
    .updateTable('Page')
    .set({
      teamId: null,
      parentPageId,
      isParentLinked: true,
      sortOrder,
      ancestorIds: [...ancestorIds, parentPageId]
    })
    .where('id', '=', pageId)
    .execute()

  // make sure the viewer stays an owner no matter what so they can undo the action
  await selectDescendantPages(trx, pageId)
    .insertInto('PageUserAccess')
    .columns(['pageId', 'userId', 'role'])
    .expression((eb) =>
      eb
        .selectFrom('descendants as d')
        .where(({not, exists, selectFrom}) =>
          not(
            exists(
              selectFrom('PageAccess')
                .select('pageId')
                .whereRef('PageAccess.pageId', '=', 'd.id')
                .where('PageAccess.userId', '=', viewerId)
                .where('PageAccess.role', '=', 'owner')
            )
          )
        )
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
        .where(({eb, ref}) => eb(ref('PageUserAccess.role'), '!=', 'owner'))
    )
    .execute()
  await trx.commit().execute()
}
