/*
 @name upsertIntegrationProviderQuery
 */
INSERT INTO
  "IntegrationProvider" (
    "service",
    "authStrategy",
    "scope",
    "clientId",
    "tenantId",
    "clientSecret",
    "consumerKey",
    "consumerSecret",
    "serverBaseUrl",
    "webhookUrl",
    "sharedSecret",
    "teamId",
    "orgId"
  )
VALUES
  (
    :service,
    :authStrategy,
    :scope,
    :clientId,
    :tenantId,
    :clientSecret,
    :consumerKey,
    :consumerSecret,
    :serverBaseUrl,
    :webhookUrl,
    :sharedSecret,
    :teamId,
    :orgId
  )
ON CONFLICT ("orgId", "teamId", "service", "authStrategy") DO UPDATE SET
  "service" = EXCLUDED."service",
  "authStrategy" = EXCLUDED."authStrategy",
  "scope" = EXCLUDED."scope",
  "clientId" = EXCLUDED."clientId",
  "tenantId" = EXCLUDED."tenantId",
  "clientSecret" = EXCLUDED."clientSecret",
  "consumerKey" = EXCLUDED."consumerKey",
  "consumerSecret" = EXCLUDED."consumerSecret",
  "serverBaseUrl" = EXCLUDED."serverBaseUrl",
  "webhookUrl" = EXCLUDED."webhookUrl",
  "sharedSecret" = EXCLUDED."sharedSecret",
  "updatedAt" = CURRENT_TIMESTAMP,
  "isActive" = TRUE

RETURNING id;
