/*
  @name removeIntegrationTokenQuery
*/
UPDATE "IntegrationToken"
SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
WHERE "integrationProviderId" = :providerId
  AND "teamId" = :teamId
  AND "userId" = :userId
  AND "isActive" = TRUE;