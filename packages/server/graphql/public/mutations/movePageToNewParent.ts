import getKysely from '../../../postgres/getKysely'
import {selectDescendantPages} from '../../../postgres/select'

export const movePageToNewParent = async (
  viewerId: string,
  pageId: number,
  parentPageId: number,
  sortOrder: string
) => {
  const pg = getKysely()
  await selectDescendantPages(pg, pageId)
    // Remove previous access for all descendants (if the new parent doesn't have the same access *This is the complex join in deletes)
    // Copy parent access to all descendants (if new parent has a different role, adopt that)
    // The extra complexity is necessary to reduce the number of rows deleted/inserted, which means fewer triggers
    .with('delUsers', (qc) =>
      qc
        .deleteFrom('PageUserAccess as cua')
        .using('descendants as d')
        .leftJoin('PageUserAccess as pua', (join) =>
          join.onRef('pua.pageId', '=', 'd.parentPageId').onRef('pua.userId', '=', 'cua.userId')
        )
        .whereRef('cua.pageId', '=', 'd.id')
        .where('pua.userId', 'is', null)
    )
    .with('delTeams', (qc) =>
      qc
        .deleteFrom('PageTeamAccess as cta')
        .using('descendants as d')
        .leftJoin('PageTeamAccess as pta', (join) =>
          join.onRef('pta.pageId', '=', 'd.parentPageId').onRef('pta.teamId', '=', 'cta.teamId')
        )
        .whereRef('cta.pageId', '=', 'd.id')
        .where('pta.teamId', 'is', null)
    )
    .with('delOrgs', (qc) =>
      qc
        .deleteFrom('PageOrganizationAccess as coa')
        .using('descendants as d')
        .leftJoin('PageOrganizationAccess as poa', (join) =>
          join.onRef('poa.pageId', '=', 'd.parentPageId').onRef('poa.orgId', '=', 'coa.orgId')
        )
        .whereRef('coa.pageId', '=', 'd.id')
        .where('poa.orgId', 'is', null)
    )
    .with('delExts', (qc) =>
      qc
        .deleteFrom('PageExternalAccess as cea')
        .using('descendants as d')
        .leftJoin('PageExternalAccess as pea', (join) =>
          join.onRef('pea.pageId', '=', 'd.parentPageId').onRef('pea.email', '=', 'cea.email')
        )
        .whereRef('cea.pageId', '=', 'd.id')
        .where('pea.email', 'is', null)
    )
    .with('upsertUsers', (qc) =>
      qc
        .insertInto('PageUserAccess')
        .columns(['pageId', 'userId', 'role'])
        .expression((eb) =>
          eb
            .selectFrom('descendants as d')
            .innerJoin('PageUserAccess as pua', 'pua.pageId', 'd.parentPageId')
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
            .innerJoin('PageTeamAccess as pta', 'pta.pageId', 'd.parentPageId')
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
            .innerJoin('PageOrganizationAccess as poa', 'poa.pageId', 'd.parentPageId')
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
            .innerJoin('PageExternalAccess as pea', 'pea.pageId', 'd.parentPageId')
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
    .with('upsertViewer', (qc) =>
      qc
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
              eb.val('owner').as('role')
            ])
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
    .updateTable('Page')
    .set({
      teamId: null,
      parentPageId,
      isParentLinked: true,
      sortOrder
    })
    .where('id', '=', pageId)
    .execute()
}
