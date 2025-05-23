/*
  @name updateTeamByTeamIdQuery
  @param ids -> (...)
*/
UPDATE "Team" SET
  "name" = COALESCE(:name, "name"),
  "autoJoin" = COALESCE(:autoJoin, "autoJoin"),
  "isArchived" = COALESCE(:isArchived, "isArchived"),
  "lastMeetingType" = COALESCE(:lastMeetingType, "lastMeetingType"),
  "orgId" = COALESCE(:orgId, "orgId"),
  "qualAIMeetingsCount" = COALESCE(:qualAIMeetingsCount, "qualAIMeetingsCount")
WHERE id IN :ids
RETURNING *;
