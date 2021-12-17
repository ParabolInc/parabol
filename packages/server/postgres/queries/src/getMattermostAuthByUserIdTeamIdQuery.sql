/*
  @name getMattermostAuthByUserIdTeamIdQuery
*/
SELECT * from "MattermostAuth"
WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE;
