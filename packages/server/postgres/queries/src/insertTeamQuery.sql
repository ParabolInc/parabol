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
  "isOneOnOneTeam",
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
  :isOneOnOneTeam,
  :updatedAt
);
