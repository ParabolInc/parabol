/*
 @name upsertTeamMemberIntegrationAuthQuery
 @param auth -> (providerId, teamId, userId, service, accessToken, refreshToken, scopes, accessTokenSecret, expiresAt)
 */
INSERT INTO
  "TeamMemberIntegrationAuth" (
    "providerId",
    "teamId",
    "userId",
    "service",
    "accessToken",
    "refreshToken",
    "scopes",
    "accessTokenSecret",
    "expiresAt"
  )
VALUES
  :auth ON CONFLICT ("userId", "teamId", "service") DO
UPDATE
SET
  (
    "providerId",
    "accessToken",
    "refreshToken",
    "scopes",
    "accessTokenSecret",
    "expiresAt",
    "isActive",
    "updatedAt"
  ) = (
    EXCLUDED."providerId",
    EXCLUDED."accessToken",
    EXCLUDED."refreshToken",
    EXCLUDED."scopes",
    EXCLUDED."accessTokenSecret",
    EXCLUDED."expiresAt",
    TRUE,
    CURRENT_TIMESTAMP
  );
