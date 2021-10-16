/*
  @name insertIntegrationProviderQuery
*/
INSERT INTO "IntegrationProvider" (
  "providerType",
  "providerTokenType",
  "providerScope",
  "name",
  "serverBaseUri",
  "oauthClientId",
  "oauthClientSecret",
  "scopes",
  "orgId",
  "teamId"
) VALUES (
  :providerType,
  :providerTokenType,
  :providerScope,
  :name,
  :serverBaseUri,
  :oauthClientId,
  :oauthClientSecret,
  :scopes,
  :orgId,
  :teamId
);
