/*
  @name getDiscussionsByIdsQuery
  @param ids -> (...)
*/
SELECT * FROM "Discussion"
WHERE id in :ids;
