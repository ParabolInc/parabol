/*
  @name decrementFreeTemplatesRemainingQuery
*/
UPDATE "User"
SET "freeCustomTemplatesRemaining" = CASE
  WHEN "freeCustomTemplatesRemaining" > 0 THEN "freeCustomTemplatesRemaining" - 1
  ELSE "freeCustomTemplatesRemaining"
END
WHERE "id" = :userId;
