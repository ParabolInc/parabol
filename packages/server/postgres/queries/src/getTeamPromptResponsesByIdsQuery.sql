/*
  @name getTeamPromptResponsesByIdsQuery
  @param ids -> (...)
  TODO: change to SELECT * when we figure out how to deal with reactjis column
*/
SELECT "id", "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent" FROM "TeamPromptResponse"
WHERE id in :ids;
