/*
  @name getUsersByIdQuery
  @param ids -> (...)
*/
SELECT * FROM "User"
WHERE id in :ids;
