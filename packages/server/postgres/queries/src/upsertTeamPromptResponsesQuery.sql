/*
  @name upsertTeamPromptResponsesQuery
  @param responses -> ((meetingId, userId, sortOrder, content, plaintextContent)...)
*/
INSERT INTO "TeamPromptResponse" ("meetingId", "userId", "sortOrder", "content", "plaintextContent")
VALUES :responses
ON CONFLICT ("meetingId", "userId") DO UPDATE SET
  "content" = EXCLUDED."content",
  "plaintextContent" = EXCLUDED."plaintextContent"
RETURNING id;
