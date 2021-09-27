/*
  @name getTeamsByOrgIdsQuery
  @param orgIds -> (...)
*/
SELECT * FROM "Team"
WHERE "orgId" IN :orgIds
AND "isArchived" = :isArchived;
