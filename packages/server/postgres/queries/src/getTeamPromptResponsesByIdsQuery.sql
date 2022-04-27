/*
  @name getTeamPromptResponsesByIdsQuery
  @param ids -> (...)
*/
SELECT "id", "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent" FROM "TeamPromptResponse"
WHERE id in :ids;
