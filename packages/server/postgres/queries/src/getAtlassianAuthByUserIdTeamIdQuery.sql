/*
  @name getAtlassianAuthByUserIdTeamIdQuery
*/
SELECT * from "AtlassianAuth"
WHERE "userId" = :userId AND "teamId" = :teamId AND "isActive" = TRUE;
