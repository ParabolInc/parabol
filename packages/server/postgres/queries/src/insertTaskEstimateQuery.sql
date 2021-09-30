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
  "jiraFieldId",
  "githubLabelName"
) VALUES (
  :changeSource,
  :name,
  :label,
  :taskId,
  :userId,
  :meetingId,
  :stageId,
  :discussionId,
  :jiraFieldId,
  :githubLabelName
);
