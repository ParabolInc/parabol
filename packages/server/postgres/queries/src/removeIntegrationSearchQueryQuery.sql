/*
  @name removeIntegrationSearchQueryQuery
*/
DELETE FROM "IntegrationSearchQuery"
-- userId and teamId added here for validation
WHERE "id" = :id AND "userId" = :userId AND "teamId" = :teamId;
