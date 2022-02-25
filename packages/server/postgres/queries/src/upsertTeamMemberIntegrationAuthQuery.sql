/*
 @name upsertTeamMemberIntegrationAuthQuery
 @param auth -> (providerId, teamId, userId, service, accessToken, refreshToken, scopes, accessTokenSecret)
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
    "accessTokenSecret"
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
    "isActive",
    "updatedAt"
  ) = (
    EXCLUDED."providerId",
    EXCLUDED."accessToken",
    EXCLUDED."refreshToken",
    EXCLUDED."scopes",
    EXCLUDED."accessTokenSecret",
    TRUE,
    CURRENT_TIMESTAMP
  );
