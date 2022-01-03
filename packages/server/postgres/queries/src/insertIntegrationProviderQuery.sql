/*
 @name insertIntegrationProviderQuery
 */
INSERT INTO
  "IntegrationProvider" (
    "provider",
    "type",
    "scope",
    "name",
    "providerMetadata",
    "orgId",
    "teamId"
  )
VALUES
  (
    :provider,
    :type,
    :scope,
    :name,
    :providerMetadata,
    :orgId,
    :teamId
  );
