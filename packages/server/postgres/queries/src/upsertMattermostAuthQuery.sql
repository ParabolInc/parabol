/*
 @name upsertMattermostAuthQuery
 @param auth -> (webhookUrl, userId, teamId)
 */
INSERT INTO "MattermostAuth" (
    "webhookUrl",
    "userId",
    "teamId"
  )
VALUES :auth ON CONFLICT ("userId", "teamId") DO
UPDATE
SET (
    "isActive",
    "updatedAt",
    "webhookUrl",
    "teamId",
    "userId"
  ) = (
    TRUE,
    CURRENT_TIMESTAMP,
    EXCLUDED."webhookUrl",
    EXCLUDED."teamId",
    EXCLUDED."userId"
  );