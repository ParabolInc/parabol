/*
 @name getTeamMemberIntegrationAuthQuery
 */
SELECT * FROM "TeamMemberIntegrationAuth"
WHERE "teamId" = :teamId
AND "userId" = :userId
AND "service" = :service
AND "isActive" = TRUE;
