/*
  @name getAzureDevOpsAuthsByUserIdQuery
*/
SELECT * from "AzureDevOpsAuth"
WHERE "userId" = :userId AND "isActive" = TRUE;
