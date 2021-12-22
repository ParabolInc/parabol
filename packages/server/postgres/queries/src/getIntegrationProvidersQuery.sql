/*
 @name getIntegrationProvidersQuery
 */
SELECT
  *
FROM
  "IntegrationProvider"
WHERE
  "provider" = :provider
  AND "isActive" = TRUE
  AND (
    "scope" = 'global'
    OR (
      "scope" = 'org'
      AND "orgId" = :orgId
    )
    OR (
      "scope" = 'team'
      AND "teamId" = :teamId
    )
  );
