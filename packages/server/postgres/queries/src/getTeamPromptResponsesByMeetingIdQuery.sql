/*
  @name getTeamPromptResponsesByMeetingIdQuery
  @param meetingIds -> (...)
*/
SELECT CONCAT('teamPromptResponse:', "id") as id, "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent", to_json("reactjis") as "reactjis" FROM "TeamPromptResponse"
WHERE "meetingId" in :meetingIds;
