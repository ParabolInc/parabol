/*
  @name getMattermostBestAuthByUserIdTeamIdQuery
*/
SELECT ("userId" = :userId)::int AS "userEquality", *  
  FROM "MattermostAuth"
  WHERE "teamId" = :teamId AND "isActive" = TRUE
  ORDER BY "userEquality" DESC, "updatedAt" DESC
  LIMIT 1;