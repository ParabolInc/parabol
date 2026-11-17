import {type Kysely, sql} from 'kysely'
import type {DB} from './types/pg'

type NewPageAccess = {
  pageIds: number[]
  ownerId: string
  parentPageId?: number | null
  teamId?: string | null
}

export const insertNewPageAccess = async (
  db: Kysely<DB>,
  {pageIds, ownerId, parentPageId, teamId}: NewPageAccess
) => {
  await db
    .insertInto('PageUserAccess')
    .values(pageIds.map((pageId) => ({userId: ownerId, pageId, role: 'owner' as const})))
    .execute()
  if (!parentPageId) {
    if (teamId) {
      await db
        .insertInto('PageTeamAccess')
        .values(pageIds.map((pageId) => ({teamId, pageId, role: 'editor' as const})))
        .execute()
    }
    return
  }
  const withNewPages = db.with('newPage', (qc) =>
    qc.selectNoFrom(sql<number>`unnest(${sql.val(pageIds)}::int[])`.as('id'))
  )
  await Promise.all([
    withNewPages
      .insertInto('PageUserAccess')
      .columns(['userId', 'pageId', 'role'])
      .expression((eb) =>
        eb
          .selectFrom(['PageUserAccess', 'newPage'])
          .select(['PageUserAccess.userId', 'newPage.id as pageId', 'PageUserAccess.role'])
          .where('PageUserAccess.pageId', '=', parentPageId)
          .where('PageUserAccess.userId', '!=', ownerId)
      )
      .execute(),
    withNewPages
      .insertInto('PageTeamAccess')
      .columns(['teamId', 'pageId', 'role'])
      .expression((eb) =>
        eb
          .selectFrom(['PageTeamAccess', 'newPage'])
          .select(['PageTeamAccess.teamId', 'newPage.id as pageId', 'PageTeamAccess.role'])
          .where('PageTeamAccess.pageId', '=', parentPageId)
      )
      .execute(),
    withNewPages
      .insertInto('PageOrganizationAccess')
      .columns(['orgId', 'pageId', 'role'])
      .expression((eb) =>
        eb
          .selectFrom(['PageOrganizationAccess', 'newPage'])
          .select([
            'PageOrganizationAccess.orgId',
            'newPage.id as pageId',
            'PageOrganizationAccess.role'
          ])
          .where('PageOrganizationAccess.pageId', '=', parentPageId)
      )
      .execute(),
    withNewPages
      .insertInto('PageExternalAccess')
      .columns(['email', 'pageId', 'role', 'invitedBy'])
      .expression((eb) =>
        eb
          .selectFrom(['PageExternalAccess', 'newPage'])
          .select([
            'PageExternalAccess.email',
            'newPage.id as pageId',
            'PageExternalAccess.role',
            'PageExternalAccess.invitedBy'
          ])
          .where('PageExternalAccess.pageId', '=', parentPageId)
      )
      .execute()
  ])
}
