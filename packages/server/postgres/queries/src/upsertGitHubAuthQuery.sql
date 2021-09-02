/*
  @name upsertGitHubAuthQuery
  @param auth -> (accessToken, login, teamId, userId, scope)
*/
INSERT INTO "GitHubAuth" ("accessToken", "login", "teamId", "userId", "scope")
VALUES :auth
ON CONFLICT ("userId", "teamId")
DO UPDATE
SET ("accessToken", "updatedAt", "isActive", "login", "scope") = (EXCLUDED."accessToken", CURRENT_TIMESTAMP, TRUE, EXCLUDED.login, EXCLUDED.scope);
