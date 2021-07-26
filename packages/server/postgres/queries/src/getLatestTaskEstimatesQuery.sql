/*
  @name getLatestTaskEstimatesQuery
  @param taskIds -> (...)
*/
SELECT DISTINCT ON("taskId", "name") * From "TaskEstimate"
WHERE "taskId" in :taskIds
ORDER BY "taskId", "name", "createdAt" desc;
