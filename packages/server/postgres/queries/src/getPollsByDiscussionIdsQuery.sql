/*
  @name getPollsByDiscussionIdsQuery
  @param discussionIds -> (...)
*/
SELECT * FROM "Poll"
WHERE "discussionId" in :discussionIds;
