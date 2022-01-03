/*
 @name updateIntegrationProviderQuery
 @param ids -> (...)
 */
UPDATE
  "IntegrationProvider"
SET
  "provider" = COALESCE(:provider, "provider"),
  "type" = COALESCE(:type, "type"),
  "scope" = COALESCE(:scope, "scope"),
  "name" = COALESCE(:name, "name"),
  "providerMetadata" = COALESCE(:providerMetadata, "providerMetadata"),
  "orgId" = COALESCE(:orgId, "orgId"),
  "teamId" = COALESCE(:teamId, "teamId")
WHERE
  id IN :ids;
