/*
  @name getAzureDevOpsAuthsByUserIdQuery
*/
SELECT * from "TeamMemberIntegrationAuth"
WHERE "userId" = :userId AND "isActive" = TRUE;
