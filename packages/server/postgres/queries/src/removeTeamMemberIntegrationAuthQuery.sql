/*
  @name removeTeamMemberIntegrationAuthQuery
*/
UPDATE "TeamMemberIntegrationAuth"
SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
WHERE "userId" = :userId
  AND "teamId" = :teamId
  AND "service" = :service
  AND "isActive" = TRUE;
