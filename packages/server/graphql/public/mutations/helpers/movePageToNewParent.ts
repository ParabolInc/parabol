import {GraphQLError} from 'graphql'
import {sql} from 'kysely'
import {getNewDataLoader} from '../../../../dataloader/getNewDataLoader'
import getKysely from '../../../../postgres/getKysely'
import {selectDescendantPages} from '../../../../postgres/select'
import {updatePageAccessTable} from '../../../../postgres/updatePageAccessTable'
import {publishPageNotification} from '../../../../utils/publishPageNotification'
import {removeCanonicalPageLinkFromPage} from '../../../../utils/tiptap/removeCanonicalPageLinkFromPage'
import {validateParentPage} from '../../../../utils/tiptap/validateParentPage'

export const movePageToNewParent = async (
  viewerId: string,
  pageId: number,
  parentPageId: number
) => {
  const pg = getKysely()
  const childPage = await pg
    .selectFrom('Page')
    .select('parentPageId')
    .where('id', '=', pageId)
    .executeTakeFirstOrThrow()
  // the child page will already have the correct parent if we created a PageLink on the parent doc
  if (childPage.parentPageId === parentPageId) return
  const parentPageWithRole = await validateParentPage(parentPageId, viewerId)
  const {ancestorIds, isPrivate} = parentPageWithRole
  if (ancestorIds.includes(pageId) || parentPageId === pageId) {
    throw new GraphQLError(`Circular reference found. A page cannot be nested in itself`)
  }
  if (childPage.parentPageId) {
    removeCanonicalPageLinkFromPage(childPage.parentPageId, pageId)
  }
  const trx = await pg.startTransaction().execute()

  await selectDescendantPages(trx, pageId)
    // Remove previous access for all descendants _that doesn't match the new parent's access_ (the exclusion means fewer writes)
    // Copy parent access to all descendants (if new parent has a different role, adopt that)
    .with('delUsers', (qc) =>
      qc
        .deleteFrom('PageUserAccess')
        .where('pageId', 'in', (eb) => eb.selectFrom('descendants').select('id'))
        .where('userId', '!=', viewerId)
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
    .set({
      teamId: null,
      parentPageId,
      isPrivate,
      isParentLinked: true,
      // sortOrder is only for top-level pages. Else, we get the order by the parent's canonical page link
      sortOrder: '',
      ancestorIds: ancestorIds.concat(parentPageId)
    })
    .where('id', '=', pageId)
    .execute()

  // upsert viewer as owner IIF nothing else is the owner
  // nothing else is the owner if PageAccess(pageId) has no owner
  const strongestRole = await updatePageAccessTable(trx, pageId)
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
  const dataLoader = getNewDataLoader()
  const operationId = dataLoader.share()
  const subOptions = {operationId, mutatorId: undefined}
  const data = {pageId}
  await publishPageNotification(pageId, 'UpdatePagePayload', data, subOptions, dataLoader)
  dataLoader.dispose()
}
