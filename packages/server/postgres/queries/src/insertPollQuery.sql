/*
  @name insertPollQuery
*/
INSERT INTO "Poll" (
  "createdById",
  "discussionId",
  "teamId",
  "meetingId",
  "threadSortOrder",
  "title"
) VALUES (
  :createdById,
  :discussionId,
  :teamId,
  :meetingId,
  :threadSortOrder,
  :title
) RETURNING "id";
