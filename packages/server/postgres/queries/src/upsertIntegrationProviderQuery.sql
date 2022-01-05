/*
 @name upsertIntegrationProviderQuery
 */
INSERT INTO
  "IntegrationProvider" (
    "service",
    "type",
    "scope",
    "providerMetadata",
    "teamId"
  )
VALUES
  (
    :service,
    :type,
    :scope,
    :providerMetadata,
    :teamId
  )
ON CONFLICT ("teamId", "service", "type") DO UPDATE SET
  "service" = EXCLUDED."service",
  "type" = EXCLUDED."type",
  "scope" = EXCLUDED."scope",
  "providerMetadata" = EXCLUDED."providerMetadata"
  "updatedAt" = CURRENT_TIMESTAMP
  "isActive" = TRUE

RETURNING id;
