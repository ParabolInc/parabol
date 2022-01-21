/*
 @name upsertIntegrationProviderQuery
 */
INSERT INTO
  "IntegrationProvider" (
    "service",
    "authStrategy",
    "scope",
    "clientId",
    "clientSecret",
    "serverBaseUrl",
    "webhookUrl",
    "teamId"
  )
VALUES
  (
    :service,
    :authStrategy,
    :scope,
    :clientId,
    :clientSecret,
    :serverBaseUrl,
    :webhookUrl,
    :teamId
  )
ON CONFLICT ("teamId", "service", "authStrategy") DO UPDATE SET
  "service" = EXCLUDED."service",
  "authStrategy" = EXCLUDED."authStrategy",
  "scope" = EXCLUDED."scope",
  "clientId" = EXCLUDED."clientId",
  "clientSecret" = EXCLUDED."clientSecret",
  "serverBaseUrl" = EXCLUDED."serverBaseUrl",
  "webhookUrl" = EXCLUDED."webhookUrl",
  "updatedAt" = CURRENT_TIMESTAMP,
  "isActive" = TRUE

RETURNING id;
