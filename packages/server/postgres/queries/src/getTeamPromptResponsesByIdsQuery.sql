/*
  @name getTeamPromptResponsesByIdsQuery
  @param ids -> (...)
*/
SELECT CONCAT('teamPromptResponse:', "id") as id, "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent", to_json("reactjis") as "reactjis" FROM "TeamPromptResponse"
WHERE CONCAT('teamPromptResponse:', "id") in :ids;
