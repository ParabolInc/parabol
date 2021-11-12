/*
  @name removeIntegrationTokenQuery
*/
UPDATE "IntegrationToken"
SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
WHERE "providerId" = :providerId
  AND "teamId" = :teamId
  AND "userId" = :userId
  AND "isActive" = TRUE;