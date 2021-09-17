/*
  @name getPollsByIdsQuery
  @param ids -> (...)
*/
SELECT * FROM "Poll"
WHERE id in :ids;
