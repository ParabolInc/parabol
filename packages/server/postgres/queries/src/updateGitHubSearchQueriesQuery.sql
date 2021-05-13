/*
  @name updateGitHubSearchQueriesQuery
*/

UPDATE "GitHubAuth" SET
  "githubSearchQueries" = :githubSearchQueries
WHERE "teamId" = :teamId AND "userId" = :userId;
