/*
  @name removeIntegrationSearchQueryQuery
*/
DELETE FROM "IntegrationSearchQuery"
WHERE "id" = :id AND "userId" = :userId AND "teamId" = :teamId;
