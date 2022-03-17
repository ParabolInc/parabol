/*
 @name upsertAzureDevOpsAuthsQuery
 @param auths -> ((accessToken, refreshToken, instanceIds, scope, accountId, teamId, userId)...)
 */
INSERT INTO "AzureDevOpsAuth" (
    "accessToken",
    "refreshToken",
    "instanceIds",
    "scope",
    "accountId",
    "teamId",
    "userId"
  )
VALUES :auths ON CONFLICT ("userId", "teamId") DO
UPDATE
SET (
    "isActive",
    "updatedAt",
    "accessToken",
    "refreshToken",
    "instanceIds",
    "scope",
    "accountId",
    "teamId",
    "userId"
  ) = (
    TRUE,
    CURRENT_TIMESTAMP,
    EXCLUDED."accessToken",
    EXCLUDED."refreshToken",
    EXCLUDED."instanceIds",
    EXCLUDED."scope",
    EXCLUDED."accountId",
    EXCLUDED."teamId",
    EXCLUDED."userId"
  );
