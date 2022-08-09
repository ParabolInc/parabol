/*
  @name insertMeetingSeriesQuery
*/
INSERT INTO "MeetingSeries" ("meetingType", "title", "recurrenceRule", "duration") VALUES (
  :meetingType,
  :title,
  :recurrenceRule,
  :duration
)
RETURNING id;
