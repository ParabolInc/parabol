/*
  @name getMeetingSeriesByIdsQuery
  @param ids -> (...)
*/
SELECT * FROM "MeetingSeries"
WHERE id in :ids;
