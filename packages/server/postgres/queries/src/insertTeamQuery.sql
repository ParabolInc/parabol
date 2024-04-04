/*
  @name insertTeamQuery
*/
INSERT INTO "Team" (
  "id",
  "autoJoin",
  "name",
  "createdAt",
  "createdBy",
  "isArchived",
  "isPaid",
  "lastMeetingType",
  "tier",
  "orgId",
  "isOnboardTeam",
  "updatedAt"
) VALUES (
  :id,
  :autoJoin,
  :name,
  :createdAt,
  :createdBy,
  :isArchived,
  :isPaid,
  :lastMeetingType,
  :tier,
  :orgId,
  :isOnboardTeam,
  :updatedAt
);
