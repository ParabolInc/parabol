/*
  @name removeGitHubAuthQuery
*/
UPDATE "GitHubAuth"
SET "isActive" = FALSE
WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE;
