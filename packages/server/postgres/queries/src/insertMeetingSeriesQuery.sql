/*
  @name insertMeetingSeriesQuery
*/
INSERT INTO "MeetingSeries" ("meetingType", "title", "recurrenceRule", "duration", "teamId", "facilitatorId") VALUES (
  :meetingType,
  :title,
  :recurrenceRule,
  :duration,
  :teamId,
  :facilitatorId
)
RETURNING id;
