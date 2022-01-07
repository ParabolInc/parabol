/*
 @name upsertTeamMemberIntegrationAuthQuery
 @param auth -> (providerId, teamId, userId, service, accessToken, refreshToken, scopes)
 */
INSERT INTO
  "TeamMemberIntegrationAuth" (
    "providerId",
    "teamId",
    "userId",
    "service",
    "accessToken",
    "refreshToken",
    "scopes"
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
    "isActive",
    "updatedAt"
  ) = (
    EXCLUDED."providerId",
    EXCLUDED."accessToken",
    EXCLUDED."refreshToken",
    EXCLUDED."scopes",
    TRUE,
    CURRENT_TIMESTAMP
  );
