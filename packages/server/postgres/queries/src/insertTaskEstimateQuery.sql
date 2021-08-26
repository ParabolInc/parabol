/*
  @name insertTaskEstimateQuery
*/
INSERT INTO "TaskEstimate" (
  "changeSource",
  "name",
  "label",
  "taskId",
  "userId",
  "meetingId",
  "stageId",
  "discussionId",
  "jiraFieldId"
) VALUES (
  :changeSource,
  :name,
  :label,
  :taskId,
  :userId,
  :meetingId,
  :stageId,
  :discussionId,
  :jiraFieldId
);
