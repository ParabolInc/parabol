/*
  @name getMeetingSeriesByIdsQuery
  @param ids -> (...)
*/
SELECT "id", "meetingType", "title", "recurrenceRule", "duration", "createdAt", "updatedAt", "cancelledAt" FROM "MeetingSeries"
WHERE id in :ids;
