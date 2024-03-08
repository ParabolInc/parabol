/*
  @name decrementFreePokerTemplatesRemainingQuery
*/
UPDATE "User"
SET "freeCustomPokerTemplatesRemaining" = CASE
  WHEN "freeCustomPokerTemplatesRemaining" > 0 THEN "freeCustomPokerTemplatesRemaining" - 1
  ELSE "freeCustomPokerTemplatesRemaining"
END
WHERE "id" = :userId;
