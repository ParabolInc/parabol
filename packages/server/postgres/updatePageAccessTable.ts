import {type ControlledTransaction, type Kysely, sql} from 'kysely'
import {selectDescendantPages} from './select'
import type {DB} from './types/pg'

export const updatePageAccessTable = (
  trx: ControlledTransaction<DB, []> | Kysely<DB>,
  pageId: number,
  options?: {
    skipUnionOrg?: boolean
    skipDeleteOld?: boolean
  }
) => {
  const skipUnionOrg = options?.skipUnionOrg
  const skipDeleteOld = options?.skipDeleteOld
  const res = selectDescendantPages(trx, pageId)
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
        .$if(!skipUnionOrg, (qb) =>
          qb.unionAll(({parens, selectFrom}) =>
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
  if (skipDeleteOld) return res.selectNoFrom(sql`1`.as('t')).execute()
  return res
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
    .selectNoFrom(sql`1`.as('t'))
    .execute()
}
