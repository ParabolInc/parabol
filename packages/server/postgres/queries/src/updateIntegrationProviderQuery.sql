/*
 @name updateIntegrationProviderQuery
 @param ids -> (...)
 */
UPDATE
  "IntegrationProvider"
SET
  "type" = COALESCE(:type, "type"),
  "tokenType" = COALESCE(:tokenType, "tokenType"),
  "scope" = COALESCE(:scope, "scope"),
  "name" = COALESCE(:name, "name"),
  "providerMetadata" = COALESCE(:providerMetadata, "providerMetadata"),
  "orgId" = COALESCE(:orgId, "orgId"),
  "teamId" = COALESCE(:teamId, "teamId")
WHERE
  id IN :ids;
