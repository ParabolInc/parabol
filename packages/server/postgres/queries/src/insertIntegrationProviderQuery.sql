/*
 @name insertIntegrationProviderQuery
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
  ) RETURNING id;
