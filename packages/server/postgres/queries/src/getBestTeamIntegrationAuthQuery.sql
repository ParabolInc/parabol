/*
 @name getBestTeamIntegrationAuthQuery
 */
SELECT *, "userId" = :userId as "isUser" FROM "TeamMemberIntegrationAuth"
WHERE "teamId" = :teamId
AND "service" = :service
AND "isActive" = TRUE
ORDER BY "isUser" DESC, "updatedAt" DESC
LIMIT 1;
