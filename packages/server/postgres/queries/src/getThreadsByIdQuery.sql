/*
  @name getThreadsByIdQuery
  @param ids -> (...)
*/
SELECT * FROM "Thread"
WHERE id in :ids;
