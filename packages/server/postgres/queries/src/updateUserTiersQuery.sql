/*
  @name updateUserTiersQuery
  @param users -> ((tier, id)...)
*/
UPDATE "User" AS u SET
  "tier" = c."tier"::"TierEnum"
FROM (VALUES :users) AS c("tier", "id") 
WHERE c."id" = u."id";