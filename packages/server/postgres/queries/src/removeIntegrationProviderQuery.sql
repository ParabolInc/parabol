/*
  @name removeIntegrationProviderQuery
*/
WITH removedTokens AS (
  UPDATE "TeamMemberIntegrationAuth"
  SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
  WHERE "providerId" = :id AND "isActive" = TRUE
)
UPDATE "IntegrationProvider"
SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = :id AND "isActive" = TRUE;
