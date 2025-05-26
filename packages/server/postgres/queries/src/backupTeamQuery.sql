/*
  @name backupTeamQuery
  @param teams -> ((
    id,
    name,
    createdAt,
    createdBy,
    isArchived,
    jiraDimensionFields,
    lastMeetingType,
    orgId,
    isOnboardTeam,
    updatedAt
  )...)
*/
INSERT INTO "Team" (
    "id",
    "name",
    "createdAt",
    "createdBy",
    "isArchived",
    "jiraDimensionFields",
    "lastMeetingType",
    "orgId",
    "isOnboardTeam",
    "updatedAt"
) VALUES :teams
ON CONFLICT (id) DO UPDATE SET
  "name" = EXCLUDED."name",
  "createdAt" = EXCLUDED."createdAt",
  "createdBy" = EXCLUDED."createdBy",
  "isArchived" = EXCLUDED."isArchived",
  "jiraDimensionFields" = EXCLUDED."jiraDimensionFields",
  "lastMeetingType" = EXCLUDED."lastMeetingType",
  "orgId" = EXCLUDED."orgId",
  "isOnboardTeam" = EXCLUDED."isOnboardTeam",
  "updatedAt" = EXCLUDED."updatedAt"
;
