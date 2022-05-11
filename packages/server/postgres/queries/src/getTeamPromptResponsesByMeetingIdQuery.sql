/*
  @name getTeamPromptResponsesByMeetingIdQuery
  @param meetingIds -> (...)
*/
SELECT "id", "createdAt", "updatedAt", "meetingId", "userId", "sortOrder", "content", "plaintextContent" FROM "TeamPromptResponse"
WHERE "meetingId" in :meetingIds;
