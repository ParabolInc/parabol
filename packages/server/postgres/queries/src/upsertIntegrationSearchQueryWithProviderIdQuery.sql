/*
 @name upsertIntegrationSearchQueryWithProviderIdQuery
 */
INSERT INTO "IntegrationSearchQuery" (
    "userId",
    "teamId",
    "service",
    "query",
    "providerId"
  )
VALUES (
    :userId,
    :teamId,
    :service,
    :query,
    :providerId
) ON CONFLICT ("userId", "teamId", "query", "service", "providerId") WHERE "providerId" IS NOT NULL DO
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