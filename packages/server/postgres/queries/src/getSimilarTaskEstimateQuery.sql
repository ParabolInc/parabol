/*
  @name getSimilarTaskEstimateQuery
  @param taskIds -> (...)
  @param labelNames -> (...)
*/
SELECT * FROM "TaskEstimate"
WHERE "taskId" in :taskIds
AND "name" = :dimensionName
AND "githubLabelName" in :labelNames
LIMIT 1;