/*
  @name getAtlassianAuthByUserIdQuery
*/
SELECT * from "AtlassianAuth"
WHERE "userId" = :userId AND "isActive" = TRUE;
