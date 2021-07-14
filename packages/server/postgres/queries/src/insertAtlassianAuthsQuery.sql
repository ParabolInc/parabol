/*
  @name insertAtlassianAuthsQuery
  @param auths -> ((accessToken, refreshToken, createdAt, updatedAt, isActive, jiraSearchQueries, cloudIds, scope, accountId, teamId, userId)...)
*/
INSERT INTO "AtlassianAuth" ("accessToken", "refreshToken", "createdAt", "updatedAt", "isActive", "jiraSearchQueries", "cloudIds", "scope", "accountId", "teamId", "userId")
VALUES :auths;
