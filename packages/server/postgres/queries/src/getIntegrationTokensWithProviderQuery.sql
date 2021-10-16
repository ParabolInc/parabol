/*
  @name getIntegrationTokensWithProviderQuery
*/
SELECT
  "IntegrationToken".*,
  "IntegrationProvider"."id" AS "IntegrationProvider_id",
  "IntegrationProvider"."providerType" AS "IntegrationProvider_providerType",
  "IntegrationProvider"."providerScope" AS "IntegrationProvider_providerScope",
  "IntegrationProvider"."orgId" AS "IntegrationProvider_orgId",
  "IntegrationProvider"."teamId" AS "IntegrationProvider_teamId",
  "IntegrationProvider"."isActive" AS "IntegrationProvider_isActive",
  "IntegrationProvider"."name" AS "IntegrationProvider_name",
  "IntegrationProvider"."serverBaseUri" AS "IntegrationProvider_serverBaseUri",
  "IntegrationProvider"."scopes" AS "IntegrationProvider_scopes",
  "IntegrationProvider"."oauthClientId" AS "IntegrationProvider_oauthClientId",
  "IntegrationProvider"."createdAt" AS "IntegrationProvider_createdAt",
  "IntegrationProvider"."updatedAt" AS "IntegrationProvider_updatedAt"
FROM "IntegrationToken" 
  JOIN "IntegrationProvider"
  ON ("IntegrationToken"."integrationProviderId" = "IntegrationProvider"."id") 
  WHERE (
	  "IntegrationToken"."teamId" = :teamId
	  AND (FALSE = :byUserId OR (TRUE = :byUserId AND "IntegrationToken"."userId" = :userId))
    AND "IntegrationProvider"."providerType" = :providerType
    AND "IntegrationToken"."isActive" = TRUE
    AND "IntegrationProvider"."isActive" = TRUE
  );
