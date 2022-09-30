/*
  @name restartMeetingSeriesByIdQuery
*/
UPDATE "MeetingSeries" SET
  "recurrenceRule" = COALESCE(:recurrenceRule, "recurrenceRule"),
  "cancelledAt" = NULL
WHERE id = :id;
