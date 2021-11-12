/*
  @name insertIntegrationProviderQuery
*/
INSERT INTO "IntegrationProvider" (
  "type",
  "tokenType",
  "scope",
  "name",
  "serverBaseUri",
  "oauthClientId",
  "oauthClientSecret",
  "oauthScopes",
  "orgId",
  "teamId"
) VALUES (
  :type,
  :tokenType,
  :scope,
  :name,
  :serverBaseUri,
  :oauthClientId,
  :oauthClientSecret,
  :oauthScopes,
  :orgId,
  :teamId
);
