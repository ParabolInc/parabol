/*
  @name insertIntegrationProviderQuery
*/
INSERT INTO "IntegrationProvider" (
  "type",
  "tokenType",
  "scope",
  "name",
  "providerMetadata",
  "orgId",
  "teamId"
) VALUES (
  :type,
  :tokenType,
  :scope,
  :name,
  :providerMetadata,
  :orgId,
  :teamId
);
