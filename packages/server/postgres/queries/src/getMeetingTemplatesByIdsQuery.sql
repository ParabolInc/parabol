/*
  @name getMeetingTemplatesByIdsQuery
  @param ids -> (...)
*/
SELECT * FROM "MeetingTemplate"
WHERE id in :ids;
