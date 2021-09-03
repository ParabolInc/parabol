/*
  @name archiveTeamsByTeamIdsQuery
  @param ids -> (...)
*/
UPDATE "Team" SET
  "isArchived" = true
WHERE
  id IN :ids AND
  "isArchived" = false
RETURNING *;
