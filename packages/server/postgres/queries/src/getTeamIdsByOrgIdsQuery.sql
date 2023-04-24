/*
  @name getTeamIdsByOrgIdsQuery
  @param orgIds -> (...)
*/
SELECT "id" FROM "Team"
WHERE "orgId" IN :orgIds
AND "isArchived" = :isArchived;
