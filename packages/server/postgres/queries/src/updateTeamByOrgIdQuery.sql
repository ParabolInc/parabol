/*
  @name updateTeamByOrgIdQuery
*/
UPDATE "Team" SET
  "name" = COALESCE(:name, "name"),
  "isArchived" = COALESCE(:isArchived, "isArchived"),
  "isPaid" = COALESCE(:isPaid, "isPaid"),
  "lastMeetingType" = COALESCE(:lastMeetingType, "lastMeetingType"),
  "tier" = COALESCE(:tier, "tier"),
  "orgId" = COALESCE(:orgId, "orgId")
WHERE "orgId" = :orgId
RETURNING "id";
