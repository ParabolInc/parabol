/*
  @name updateIntegrationProviderQuery
  @param ids -> (...)
*/
UPDATE "IntegrationProvider" SET
  "providerType" = COALESCE(:providerType, "providerType"),
  "providerTokenType" = COALESCE(:providerTokenType, "providerTokenType"),
  "providerScope" = COALESCE(:providerScope, "providerScope"),
  "name" = COALESCE(:name, "name"),
  "serverBaseUri" = COALESCE(:serverBaseUri, "serverBaseUri"),
  "oauthClientId" = COALESCE(:oauthClientId, "oauthClientId"),
  "oauthClientSecret" = COALESCE(:oauthClientSecret, "oauthClientSecret"),
  "scopes" = COALESCE(:scopes, "scopes"),
  "orgId" = COALESCE(:orgId, "orgId"),
  "teamId" = COALESCE(:teamId, "teamId")
 WHERE id IN :ids;