/*
  @name getActiveMeetingSeriesByTeamIdsQuery
  @param teamIds -> (...)
*/
SELECT * FROM "MeetingSeries"
WHERE "teamId" IN :teamIds
AND "cancelledAt" IS NULL;
