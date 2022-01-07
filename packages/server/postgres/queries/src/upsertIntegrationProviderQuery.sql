/*
 @name upsertIntegrationProviderQuery
 */
INSERT INTO
  "IntegrationProvider" (
    "service",
    "type",
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
    :type,
    :scope,
    :clientId,
    :clientSecret,
    :serverBaseUrl,
    :webhookUrl,
    :teamId
  )
ON CONFLICT ("teamId", "service", "type") DO UPDATE SET
  "service" = EXCLUDED."service",
  "type" = EXCLUDED."type",
  "scope" = EXCLUDED."scope",
  "clientId" = EXCLUDED."clientId",
  "clientSecret" = EXCLUDED."clientSecret",
  "serverBaseUrl" = EXCLUDED."serverBaseUrl",
  "webhookUrl" = EXCLUDED."webhookUrl",
  "updatedAt" = CURRENT_TIMESTAMP,
  "isActive" = TRUE

RETURNING id;
