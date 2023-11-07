/*
  @name updateUserTiersQuery
  @param users -> ((tier, trialStartDate, id)...)
*/
UPDATE "User" AS u SET
  "tier" = c."tier"::"TierEnum",
  "trialStartDate" = c."trialStartDate"::TIMESTAMP
FROM (VALUES :users) AS c("tier", "trialStartDate", "id")
WHERE c."id" = u."id";
