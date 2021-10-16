/*
  @name removeMattermostAuthQuery
*/
UPDATE "MattermostAuth"
SET "isActive" = FALSE, "updatedAt" = CURRENT_TIMESTAMP
WHERE "teamId" = :teamId AND "isActive" = TRUE;
