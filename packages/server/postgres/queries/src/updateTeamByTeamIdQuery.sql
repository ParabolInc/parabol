/*
  @name updateTeamByTeamIdQuery
  @param ids -> (...)
*/
UPDATE "Team" SET
  "name" = COALESCE(:name, "name"),
  "autoJoin" = COALESCE(:autoJoin, "autoJoin"),
  "isArchived" = COALESCE(:isArchived, "isArchived"),
  "isPaid" = COALESCE(:isPaid, "isPaid"),
  "lastMeetingType" = COALESCE(:lastMeetingType, "lastMeetingType"),
  "tier" = COALESCE(:tier, "tier"),
  "orgId" = COALESCE(:orgId, "orgId"),
  "lockMessageHTML" = COALESCE(:lockMessageHTML, "lockMessageHTML"),
  "qualAIMeetingsCount" = COALESCE(:qualAIMeetingsCount, "qualAIMeetingsCount")
WHERE id IN :ids
RETURNING *;
