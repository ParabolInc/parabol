import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Connections made before projects could be chosen keep reaching every project; new ones start with none
  await sql`
    UPDATE "TeamMemberIntegrationAuth"
    SET meta = '{"repoAccess": "all"}'::jsonb
    WHERE service = 'azureDevOps' AND "isActive" = true AND meta IS NULL
  `.execute(db)

  // issueType was "<process>:<work item type>", which no mapping survived a custom process with.
  // Where dropping the process makes two rows collide, keep the newest
  await sql`
    DELETE FROM "IntegrationDimensionFieldMap" a
    USING "IntegrationDimensionFieldMap" b
    WHERE a.service = 'azureDevOps' AND b.service = 'azureDevOps'
      AND a."teamId" = b."teamId" AND a."repoId" = b."repoId" AND a."dimensionName" = b."dimensionName"
      AND substring(a."issueType" from '[^:]*$') = substring(b."issueType" from '[^:]*$')
      AND (a."updatedAt", a.id) < (b."updatedAt", b.id)
  `.execute(db)
  await sql`
    UPDATE "IntegrationDimensionFieldMap"
    SET "issueType" = substring("issueType" from '[^:]*$')
    WHERE service = 'azureDevOps' AND "issueType" LIKE '%:%'
  `.execute(db)
  await sql`
    UPDATE "IntegrationDimensionFieldMap" m
    SET "fieldId" = f."referenceName", "fieldType" = 'number'
    FROM (VALUES
      ('__storyPoints', 'Microsoft.VSTS.Scheduling.StoryPoints'),
      ('__origEst', 'Microsoft.VSTS.Scheduling.OriginalEstimate'),
      ('__remainingWork', 'Microsoft.VSTS.Scheduling.RemainingWork'),
      ('__effort', 'Microsoft.VSTS.Scheduling.Effort'),
      ('__size', 'Microsoft.VSTS.Scheduling.Size')
    ) AS f("legacyId", "referenceName")
    WHERE m.service = 'azureDevOps' AND m."fieldId" = f."legacyId"
  `.execute(db)
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  // The process prefix and the rows that collided on it cannot be restored; the field ids can
  await sql`
    UPDATE "IntegrationDimensionFieldMap" m
    SET "fieldId" = f."legacyId", "fieldType" = 'string'
    FROM (VALUES
      ('__storyPoints', 'Microsoft.VSTS.Scheduling.StoryPoints'),
      ('__origEst', 'Microsoft.VSTS.Scheduling.OriginalEstimate'),
      ('__remainingWork', 'Microsoft.VSTS.Scheduling.RemainingWork'),
      ('__effort', 'Microsoft.VSTS.Scheduling.Effort'),
      ('__size', 'Microsoft.VSTS.Scheduling.Size')
    ) AS f("legacyId", "referenceName")
    WHERE m.service = 'azureDevOps' AND m."fieldId" = f."referenceName"
  `.execute(db)
  await sql`
    UPDATE "TeamMemberIntegrationAuth" SET meta = NULL WHERE service = 'azureDevOps'
  `.execute(db)
}
