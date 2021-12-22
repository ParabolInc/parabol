/*
 @name getIntegrationTokensWithProviderQuery
 */
SELECT
  "IntegrationToken".*,
  "IntegrationProvider"."id" AS "IntegrationProvider_id",
  "IntegrationProvider"."provider" AS "IntegrationProvider_provider",
  "IntegrationProvider"."type" AS "IntegrationProvider_type",
  "IntegrationProvider"."scope" AS "IntegrationProvider_scope",
  "IntegrationProvider"."orgId" AS "IntegrationProvider_orgId",
  "IntegrationProvider"."teamId" AS "IntegrationProvider_teamId",
  "IntegrationProvider"."isActive" AS "IntegrationProvider_isActive",
  "IntegrationProvider"."name" AS "IntegrationProvider_name",
  "IntegrationProvider"."providerMetadata" AS "IntegrationProvider_providerMetadata",
  "IntegrationProvider"."createdAt" AS "IntegrationProvider_createdAt",
  "IntegrationProvider"."updatedAt" AS "IntegrationProvider_updatedAt"
FROM
  "IntegrationToken"
  JOIN "IntegrationProvider" ON (
    "IntegrationToken"."providerId" = "IntegrationProvider"."id"
  )
WHERE
  (
    "IntegrationToken"."teamId" = :teamId
    AND (
      FALSE = :byUserId
      OR (
        TRUE = :byUserId
        AND "IntegrationToken"."userId" = :userId
      )
    )
    AND "IntegrationProvider"."provider" = :provider
    AND "IntegrationToken"."isActive" = TRUE
    AND "IntegrationProvider"."isActive" = TRUE
  );
