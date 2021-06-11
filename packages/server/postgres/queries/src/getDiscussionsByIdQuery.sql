/*
  @name getDiscussionsByIdQuery
  @param ids -> (...)
*/
SELECT * FROM "Discussion"
WHERE id in :ids;
