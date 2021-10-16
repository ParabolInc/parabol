/*
  @name insertIntegrationProviderWithTokenQuery
  @param provider -> (providerType, providerTokenType, providerScope, name, serverBaseUri, oauthClientId, oauthClientSecret, scopes, orgId, teamId)
*/
WITH providerRow AS (
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
   ) VALUES :provider RETURNING *
) INSERT INTO "IntegrationToken" (
  "teamId",
  "userId",
  "integrationProviderId",
  "accessToken",
  "expiresAt",
  "oauthRefreshToken",
  "scopes",
  "attributes"
) SELECT * FROM (VALUES (
  :teamId,
  :userId,
  (SELECT "id" FROM providerRow),
  :accessToken,
  :expiresAt::timestamp,
  :oauthRefreshToken,
  :scopes::varchar[],
  :attributes::jsonb
)) AS "integrationToken"
  ON CONFLICT ("integrationProviderId", "userId", "teamId")
  DO UPDATE
  SET ("accessToken", "oauthRefreshToken", "scopes", "integrationProviderId", "isActive", "updatedAt") = (
    EXCLUDED."accessToken",
    EXCLUDED."oauthRefreshToken",
    EXCLUDED."scopes",
    EXCLUDED."integrationProviderId",
    TRUE,
    CURRENT_TIMESTAMP
  )
   RETURNING "integrationProviderId" AS "id";