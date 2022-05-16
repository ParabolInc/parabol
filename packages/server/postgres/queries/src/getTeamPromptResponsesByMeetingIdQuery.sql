/*
  @name getTeamPromptResponsesByMeetingIdQuery
  @param meetingIds -> (...)
*/
SELECT "id", "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent", to_json("reactjis") as "reactjis" FROM "TeamPromptResponse"
WHERE "meetingId" in :meetingIds;
