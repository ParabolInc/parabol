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
    "consumerKey",
    "privateKey",
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
    :consumerKey,
    :privateKey,
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
  "consumerKey" = EXCLUDED."consumerKey",
  "privateKey" = EXCLUDED."privateKey",
  "serverBaseUrl" = EXCLUDED."serverBaseUrl",
  "webhookUrl" = EXCLUDED."webhookUrl",
  "updatedAt" = CURRENT_TIMESTAMP,
  "isActive" = TRUE

RETURNING id;
