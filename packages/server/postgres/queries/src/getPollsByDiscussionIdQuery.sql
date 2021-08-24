/*
  @name getPollsByDiscussionIdQuery
  @param discussionIds -> (...)
*/
SELECT * FROM "Poll"
WHERE "discussionId" in :discussionIds;
