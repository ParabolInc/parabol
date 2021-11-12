/*
  @name upsertIntegrationTokenQuery
  @param auth -> (accessToken, oauthRefreshToken, oauthScopes, providerId, teamId, userId)
*/
INSERT INTO "IntegrationToken" ("accessToken", "oauthRefreshToken", "oauthScopes", "providerId", "teamId", "userId")
  VALUES :auth
  ON CONFLICT ("providerId", "userId", "teamId")
  DO UPDATE
  SET ("accessToken", "oauthRefreshToken", "oauthScopes", "providerId", "isActive", "updatedAt") = (
    EXCLUDED."accessToken",
    EXCLUDED."oauthRefreshToken",
    EXCLUDED."oauthScopes",
    EXCLUDED."providerId",
    TRUE,
    CURRENT_TIMESTAMP
  ) RETURNING *;
