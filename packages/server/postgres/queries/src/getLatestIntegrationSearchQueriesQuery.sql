/*
  @name getLatestIntegrationSearchQueriesQuery
*/
SELECT * FROM "IntegrationSearchQuery"
WHERE "teamId" = :teamId
AND "userId" = :userId
AND "service" = :service
AND "providerId" IS NULL
AND "lastUsedAt" > NOW() - INTERVAL '60 DAYS'
ORDER BY "lastUsedAt" DESC
LIMIT 5;


