/*
  @name getTeamPromptResponsesByIdsQuery
  @param ids -> (...)
*/
SELECT "id", "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent", to_json("reactjis") as "reactjis" FROM "TeamPromptResponse"
WHERE id in :ids;
