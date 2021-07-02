/*
 @name upsertAtlassianAuthQuery
 @param auth -> (accessToken, refreshToken, cloudIds, scope, accountId, teamId, userId)
 */
INSERT INTO "AtlassianAuth" (
    "accessToken",
    "refreshToken",
    "cloudIds",
    "scope",
    "accountId",
    "teamId",
    "userId"
  )
VALUES :auth ON CONFLICT ("userId", "teamId") DO
UPDATE
SET (
    "isActive",
    "updatedAt",
    "accessToken",
    "refreshToken",
    "cloudIds",
    "scope",
    "accountId",
    "teamId",
    "userId"
  ) = (
    TRUE,
    CURRENT_TIMESTAMP,
    EXCLUDED."accessToken",
    EXCLUDED."refreshToken",
    EXCLUDED."cloudIds",
    EXCLUDED."scope",
    EXCLUDED."accountId",
    EXCLUDED."teamId",
    EXCLUDED."userId"
  );