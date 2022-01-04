/*
 @name updateIntegrationProviderQuery
 @param ids -> (...)
 */
UPDATE
  "IntegrationProvider"
SET
  "service" = COALESCE(:service, "service"),
  "type" = COALESCE(:type, "type"),
  "scope" = COALESCE(:scope, "scope"),
  "providerMetadata" = COALESCE(:providerMetadata, "providerMetadata"),
  "teamId" = COALESCE(:teamId, "teamId")
WHERE
  id IN :ids;
