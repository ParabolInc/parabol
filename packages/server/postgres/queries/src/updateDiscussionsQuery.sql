/*
  @name updateDiscussionsQuery
  @param ids -> (...)
*/

UPDATE "Discussion" SET
  "teamId" = COALESCE(:teamId, "teamId"),
  "meetingId" = COALESCE(:meetingId, "meetingId"),
  "discussionTopicId" = COALESCE(:discussionTopicId, "discussionTopicId"),
  "discussionTopicType" = COALESCE(:discussionTopicType, "discussionTopicType"),
  "summary" = COALESCE(:summary, "summary")
WHERE id IN :ids;
