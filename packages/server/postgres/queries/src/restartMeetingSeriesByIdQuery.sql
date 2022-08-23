/*
  @name restartMeetingSeriesByIdQuery
*/
UPDATE "MeetingSeries" SET
  "recurrenceRule" = COALESCE(:recurrenceRule, "recurrenceRule"),
  "cancelledAt" = :cancelledAt
WHERE id = :id;
