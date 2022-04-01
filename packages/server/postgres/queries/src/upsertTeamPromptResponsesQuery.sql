/*
  @name upsertTeamPromptResponsesQuery
  @param responses -> ((meetingId, userId, sortOrder, content, plaintextContent)...)
*/
INSERT INTO "TeamPromptResponse" ("meetingId", "userId", "sortOrder", "content", "plaintextContent")
VALUES :responses;
