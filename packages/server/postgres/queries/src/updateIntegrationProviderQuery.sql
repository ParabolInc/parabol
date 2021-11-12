/*
  @name updateIntegrationProviderQuery
  @param ids -> (...)
*/
UPDATE "IntegrationProvider" SET
  "type" = COALESCE(:type, "type"),
  "tokenType" = COALESCE(:tokenType, "tokenType"),
  "scope" = COALESCE(:scope, "scope"),
  "name" = COALESCE(:name, "name"),
  "serverBaseUri" = COALESCE(:serverBaseUri, "serverBaseUri"),
  "oauthClientId" = COALESCE(:oauthClientId, "oauthClientId"),
  "oauthClientSecret" = COALESCE(:oauthClientSecret, "oauthClientSecret"),
  "oauthScopes" = COALESCE(:oauthScopes, "oauthScopes"),
  "orgId" = COALESCE(:orgId, "orgId"),
  "teamId" = COALESCE(:teamId, "teamId")
 WHERE id IN :ids;