/*
  @name backfillPseudoIdQuery
  @param users -> ((pseudoId, id)...)
*/
UPDATE "User" AS u SET
  "pseudoId" = c."pseudoId"
FROM (VALUES :users) AS c("pseudoId", "id")
WHERE c."id" = u."id";
