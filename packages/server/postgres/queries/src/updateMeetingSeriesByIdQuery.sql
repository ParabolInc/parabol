/*
  @name updateMeetingSeriesByIdQuery
*/
UPDATE "MeetingSeries" SET
  "meetingType" = COALESCE(:meetingType, "meetingType"),
  "title" = COALESCE(:title, "title"),
  "recurrenceRule" = COALESCE(:recurrenceRule, "recurrenceRule"),
  "duration" = COALESCE(:duration, "duration"),
  "cancelledAt" = COALESCE(:cancelledAt, "cancelledAt")
WHERE id = :id;
