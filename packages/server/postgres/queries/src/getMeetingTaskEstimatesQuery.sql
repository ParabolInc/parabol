/*
  @name getMeetingTaskEstimatesQuery
  @param taskIds -> (...)
  @param meetingIds -> (...)
*/
SELECT DISTINCT ON("taskId", "name") * From "TaskEstimate"
WHERE "meetingId" in :meetingIds
AND "taskId" in :taskIds
ORDER BY "taskId", "name", "createdAt" desc;
