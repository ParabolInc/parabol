/*
  @name insertTeamQuery
*/
INSERT INTO "Team" (
  "id",
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
