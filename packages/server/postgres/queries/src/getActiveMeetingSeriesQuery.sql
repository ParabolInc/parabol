/*
  @name getActiveMeetingSeriesQuery
*/
SELECT * FROM "MeetingSeries"
WHERE "cancelledAt" IS NULL;
