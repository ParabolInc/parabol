/*
  @name getMattermostAuthByTeamIdQuery
*/
SELECT * from "MattermostAuth"
WHERE "teamId" = :teamId AND "isActive" = TRUE;
