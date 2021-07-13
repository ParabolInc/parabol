/*
  @name updateJiraSearchQueriesQuery
*/

UPDATE "AtlassianAuth" SET
  "jiraSearchQueries" = :jiraSearchQueries
WHERE "teamId" = :teamId AND "userId" = :userId;
