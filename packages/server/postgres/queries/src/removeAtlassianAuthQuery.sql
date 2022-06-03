/*
  @name removeAtlassianAuthQuery
*/
UPDATE "AtlassianAuth"
SET "isActive" = FALSE
WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE;
