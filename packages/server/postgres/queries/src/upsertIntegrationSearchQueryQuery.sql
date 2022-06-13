/*
 @name upsertIntegrationSearchQueryQuery
 */
INSERT INTO "IntegrationSearchQuery" (
    "userId",
    "teamId",
    "service",
    "query"
  )
VALUES (
    :userId,
    :teamId,
    :service,
    :query
) ON CONFLICT ("userId", "teamId", "query", "service") WHERE "providerId" IS NULL DO
UPDATE
SET (
    "updatedAt",
    "lastUsedAt",
    "query"
  ) = (
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    EXCLUDED."query"
  );