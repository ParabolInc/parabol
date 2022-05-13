/*
  @name removeTeamMemberIntegrationAuthQuery
*/
UPDATE "TeamMemberIntegrationAuth"
SET "isActive" = FALSE
WHERE "userId" = :userId
  AND "teamId" = :teamId
  AND "service" = :service
  AND "isActive" = TRUE;
