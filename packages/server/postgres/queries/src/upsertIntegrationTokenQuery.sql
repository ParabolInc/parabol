/*
  @name upsertIntegrationTokenQuery
  @param auth -> (accessToken, oauthRefreshToken, scopes, integrationProviderId, teamId, userId)
*/
INSERT INTO "IntegrationToken" ("accessToken", "oauthRefreshToken", "scopes", "integrationProviderId", "teamId", "userId")
  VALUES :auth
  ON CONFLICT ("integrationProviderId", "userId", "teamId")
  DO UPDATE
  SET ("accessToken", "oauthRefreshToken", "scopes", "integrationProviderId", "isActive", "updatedAt") = (
    EXCLUDED."accessToken",
    EXCLUDED."oauthRefreshToken",
    EXCLUDED."scopes",
    EXCLUDED."integrationProviderId",
    TRUE,
    CURRENT_TIMESTAMP
  ) RETURNING *;
