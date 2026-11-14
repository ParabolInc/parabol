import type {Kysely} from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  // Remove TeamMembers whose org membership is gone. authToken.tms is built from TeamMember, so
  // these users pass isTeamMember but fail isViewerOnOrg, breaking every org-scoped field
  // (Team.organization, User.organization, ...) with "Viewer is not on Organization"
  await db
    .updateTable('TeamMember')
    .from('Team')
    .set({isNotRemoved: false})
    .whereRef('Team.id', '=', 'TeamMember.teamId')
    .where('TeamMember.isNotRemoved', '=', true)
    .where('Team.isArchived', '=', false)
    .where(({not, exists, selectFrom}) =>
      not(
        exists(
          selectFrom('OrganizationUser')
            .select('id')
            .whereRef('OrganizationUser.userId', '=', 'TeamMember.userId')
            .whereRef('OrganizationUser.orgId', '=', 'Team.orgId')
            .where('OrganizationUser.removedAt', 'is', null)
        )
      )
    )
    .execute()
}

export async function down(): Promise<void> {
  // noop, the affected rows are not recoverable from the schema
}
