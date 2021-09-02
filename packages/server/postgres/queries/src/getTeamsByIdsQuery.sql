/*
  @name getTeamsByIdsQuery
  @param ids -> (...)
*/
SELECT * FROM "Team"
WHERE id IN :ids;
