/*
  @name clearOverLimitCopyQuery
  @param ids -> (...)
*/
UPDATE "User" SET
  "overLimitCopy" = NULL
WHERE id IN :ids;
