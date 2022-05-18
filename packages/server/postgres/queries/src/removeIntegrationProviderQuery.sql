/*
  @name removeIntegrationProviderQuery
*/
WITH removedTokens AS (
  UPDATE "TeamMemberIntegrationAuth"
  SET "isActive" = FALSE
  WHERE "providerId" = :id AND "isActive" = TRUE
)
UPDATE "IntegrationProvider"
SET "isActive" = FALSE
WHERE "id" = :id AND "isActive" = TRUE;
