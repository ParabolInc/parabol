/*
  @name decrementFreeRetroTemplatesRemainingQuery
*/
UPDATE "User"
SET "freeCustomRetroTemplatesRemaining" = CASE
  WHEN "freeCustomRetroTemplatesRemaining" > 0 THEN "freeCustomRetroTemplatesRemaining" - 1
  ELSE "freeCustomRetroTemplatesRemaining"
END
WHERE "id" = :userId;
