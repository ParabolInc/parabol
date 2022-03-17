/*
  @name getAzureDevOpsAuthByUserIdTeamIdQuery
*/
SELECT * from "AzureDevOpsAuth"
WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE;
