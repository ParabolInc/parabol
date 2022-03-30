/*
  @name getAzureDevOpsAuthByUserIdTeamIdQuery
*/
SELECT * from "TeamMemberIntegrationAuth"
WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE;
