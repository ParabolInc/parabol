/*
  @name removeMeetingTaskEstimatesQuery
*/
DELETE FROM "TaskEstimate"
WHERE "meetingId" = :meetingId AND "stageId" = :stageId;
