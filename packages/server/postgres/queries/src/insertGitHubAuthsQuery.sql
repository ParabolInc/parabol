/*
  @name insertGitHubAuthsQuery
  @param auths -> ((id, accessToken, createdAt, updatedAt, isActive, login, teamId, userId)...)
*/
INSERT INTO "GitHubAuth" ("id", "accessToken", "createdAt", "updatedAt", "isActive", "login", "teamId", "userId")
VALUES :auths;
