/*
  @name getPollsByIdQuery
  @param ids -> (...)
*/
SELECT * FROM "Poll"
WHERE id in :ids;
