/*
 @name updateIntegrationProviderQuery
 */
UPDATE
  "IntegrationProvider"
SET
  "scope" = COALESCE(:scope, "scope"),
  "providerMetadata" = COALESCE(:providerMetadata, "providerMetadata")
WHERE
  id = :id;
